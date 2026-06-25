import asyncio
import hashlib
import re
from datetime import datetime
from urllib.parse import urljoin, urlparse, urlunparse

import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import CrawlJob, SiteConfig
from .chroma_service import add_documents, delete_collection
from .embedding_service import chunk_text, embed_texts

# Skip these extensions — not useful text content
SKIP_EXTENSIONS = {
    ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp",
    ".mp4", ".mp3", ".zip", ".gz", ".css", ".js", ".ico", ".woff", ".woff2", ".ttf",
}

MAX_CONCURRENCY = 10
MAX_PAGES = 100  # cap for POC — prevents runaway crawls on large sites


def _normalize_url(url: str) -> str:
    parsed = urlparse(url)
    # strip fragment and common tracking params
    clean = parsed._replace(fragment="", query=_strip_tracking(parsed.query))
    normalized = urlunparse(clean).rstrip("/")
    return normalized


def _strip_tracking(query: str) -> str:
    if not query:
        return ""
    parts = [p for p in query.split("&") if not p.startswith(("utm_", "fbclid", "gclid", "ref="))]
    return "&".join(parts)


def _same_domain(base_url: str, link: str) -> bool:
    base_host = urlparse(base_url).netloc.lstrip("www.")
    link_host = urlparse(link).netloc.lstrip("www.")
    return base_host == link_host


def _should_skip(url: str) -> bool:
    path = urlparse(url).path.lower()
    return any(path.endswith(ext) for ext in SKIP_EXTENSIONS)


def _extract_text(html: str, url: str) -> tuple[str, str]:
    soup = BeautifulSoup(html, "lxml")
    # Remove nav, footer, script, style noise
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
        tag.decompose()
    title = soup.title.string.strip() if soup.title and soup.title.string else urlparse(url).netloc
    # Prefer main content areas
    body = soup.find("main") or soup.find("article") or soup.find(id="content") or soup.body
    text = body.get_text(separator=" ", strip=True) if body else soup.get_text(separator=" ", strip=True)
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return title, text


def _extract_links(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href.startswith(("mailto:", "tel:", "javascript:")):
            continue
        absolute = urljoin(base_url, href)
        parsed = urlparse(absolute)
        if parsed.scheme not in ("http", "https"):
            continue
        links.append(_normalize_url(absolute))
    return links


async def _fetch_page(client: httpx.AsyncClient, url: str) -> tuple[str, int]:
    try:
        resp = await client.get(url, timeout=15, follow_redirects=True)
        return resp.text, resp.status_code
    except Exception:
        return "", 0


async def _crawl_site(start_url: str, db_job_id: str) -> tuple[list[dict], int]:
    """BFS full-site crawl. Returns list of {url, title, text} dicts and total pages crawled."""
    visited: set[str] = set()
    queue: list[str] = [_normalize_url(start_url)]
    pages: list[dict] = []
    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)

    headers = {
        "User-Agent": "IGNAChatBot/1.0 (site indexing for AI chat; contact: support@igna.ai)",
        "Accept": "text/html,application/xhtml+xml",
    }

    async def fetch_and_process(url: str):
        nonlocal queue
        async with semaphore:
            html, status = await _fetch_page(client, url)
        if status != 200 or not html:
            return
        title, text = _extract_text(html, url)
        # Always discover links so BFS can continue even if this page has little text
        for link in _extract_links(html, url):
            if link not in visited and _same_domain(start_url, link) and not _should_skip(link):
                visited.add(link)
                queue.append(link)
        if len(text) < 100:
            return
        pages.append({"url": url, "title": title, "text": text})
        # Update live counter in DB
        _update_job_counter(db_job_id, len(pages))

    async with httpx.AsyncClient(headers=headers) as client:
        start_norm = _normalize_url(start_url)
        visited.add(start_norm)
        while queue and len(pages) < MAX_PAGES:
            batch = queue[:MAX_CONCURRENCY]
            queue = queue[MAX_CONCURRENCY:]
            await asyncio.gather(*[fetch_and_process(u) for u in batch])

    return pages, len(pages)


def _update_job_counter(job_id: str, pages_crawled: int):
    db = SessionLocal()
    try:
        job = db.query(CrawlJob).filter(CrawlJob.job_id == job_id).first()
        if job:
            job.pages_crawled = pages_crawled
            db.commit()
    finally:
        db.close()


def _chunk_id(url: str, chunk_index: int) -> str:
    url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
    return f"{url_hash}__chunk_{chunk_index}"


async def run_crawl_pipeline(job_id: str, website_url: str, site_identifier: str, customer_id: int):
    db = SessionLocal()
    try:
        job = db.query(CrawlJob).filter(CrawlJob.job_id == job_id).first()
        if not job:
            return

        job.status = "running"
        job.started_at = datetime.utcnow()
        db.commit()

        kb_identifier = f"kb_{site_identifier}"

        # Clear any prior collection for this site
        delete_collection(kb_identifier)

        # Crawl
        pages, total_crawled = await _crawl_site(website_url, job_id)

        if not pages:
            job.status = "failed"
            job.error_message = "No indexable pages found on the site"
            job.completed_at = datetime.utcnow()
            db.commit()
            return

        # Chunk + embed + store
        all_ids: list[str] = []
        all_embeddings: list[list[float]] = []
        all_documents: list[str] = []
        all_metadatas: list[dict] = []

        for page in pages:
            chunks = chunk_text(page["text"])
            if not chunks:
                continue
            embeddings = embed_texts(chunks)
            for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
                all_ids.append(_chunk_id(page["url"], i))
                all_embeddings.append(emb)
                all_documents.append(chunk)
                all_metadatas.append({"url": page["url"], "title": page["title"]})

        # Store in ChromaDB in batches to avoid memory issues
        batch_size = 100
        for i in range(0, len(all_ids), batch_size):
            add_documents(
                kb_identifier,
                ids=all_ids[i : i + batch_size],
                embeddings=all_embeddings[i : i + batch_size],
                documents=all_documents[i : i + batch_size],
                metadatas=all_metadatas[i : i + batch_size],
            )

        pages_indexed = len(pages)

        # Update job
        job.status = "completed"
        job.pages_crawled = total_crawled
        job.pages_indexed = pages_indexed
        job.completed_at = datetime.utcnow()
        db.commit()

        # Update or create SiteConfig
        site_config = db.query(SiteConfig).filter(SiteConfig.customer_id == customer_id).first()
        if site_config:
            site_config.kb_identifier = kb_identifier
            site_config.pages_indexed = pages_indexed
            site_config.updated_at = datetime.utcnow()
        else:
            from ..config import settings
            site_config = SiteConfig(
                customer_id=customer_id,
                kb_identifier=kb_identifier,
                pages_indexed=pages_indexed,
                backend_url=settings.BACKEND_URL,
            )
            db.add(site_config)
        db.commit()

    except Exception as exc:
        db = SessionLocal()
        job = db.query(CrawlJob).filter(CrawlJob.job_id == job_id).first()
        if job:
            job.status = "failed"
            job.error_message = str(exc)[:2000]
            job.completed_at = datetime.utcnow()
            db.commit()
        db.close()
        raise
    finally:
        db.close()
