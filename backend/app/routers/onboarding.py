import asyncio
import re
import secrets
import uuid
from datetime import datetime
from urllib.parse import urlparse

from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import ApiKey, CrawlJob, Customer, DeploymentMeta, SiteConfig, User
from ..schemas.customer import OnboardingRequest, OnboardingResponse
from ..services.crawler_service import run_crawl_pipeline


class SiteSummary(BaseModel):
    customer_id: int
    website_url: str
    site_identifier: str
    pages_indexed: int
    crawl_status: str
    created_at: datetime
    municipality_name: str = ""
    entity_type: str = ""

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])


def _make_site_identifier(url: str) -> str:
    netloc = urlparse(url).netloc.lower()
    netloc = re.sub(r"^www\.", "", netloc)
    slug = re.sub(r"[^a-z0-9]+", "-", netloc).strip("-")
    return slug[:50]


@router.post("/submit", response_model=OnboardingResponse, status_code=202)
def submit_onboarding(
    body: OnboardingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site_identifier = _make_site_identifier(body.website_url)

    # Create customer record
    customer = Customer(
        user_id=current_user.id,
        full_name=body.full_name,
        work_email=str(body.work_email),
        website_url=body.website_url,
        site_identifier=site_identifier,
    )
    db.add(customer)
    db.flush()  # get customer.id without full commit

    # Generate API key
    api_key_value = secrets.token_urlsafe(32)
    api_key = ApiKey(customer_id=customer.id, key_value=api_key_value)
    db.add(api_key)

    # Create crawl job
    job_id = str(uuid.uuid4())
    crawl_job = CrawlJob(
        job_id=job_id,
        customer_id=customer.id,
        website_url=body.website_url,
        status="queued",
    )
    db.add(crawl_job)
    db.commit()
    db.refresh(customer)

    # Fire background crawl
    background_tasks.add_task(
        _run_async_crawl, job_id, body.website_url, site_identifier, customer.id
    )

    return OnboardingResponse(
        job_id=job_id,
        customer_id=customer.id,
        site_identifier=site_identifier,
        status="queued",
    )


def _run_async_crawl(job_id: str, website_url: str, site_identifier: str, customer_id: int):
    asyncio.run(run_crawl_pipeline(job_id, website_url, site_identifier, customer_id))


@router.get("/sites", response_model=list[SiteSummary])
def get_my_sites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customers = (
        db.query(Customer)
        .join(DeploymentMeta, DeploymentMeta.customer_id == Customer.id)
        .filter(Customer.user_id == current_user.id)
        .order_by(Customer.created_at.desc())
        .all()
    )

    results = []
    for c in customers:
        latest_job = (
            db.query(CrawlJob)
            .filter(CrawlJob.customer_id == c.id)
            .order_by(CrawlJob.created_at.desc())
            .first()
        )
        site_config = db.query(SiteConfig).filter(SiteConfig.customer_id == c.id).first()
        meta = db.query(DeploymentMeta).filter(DeploymentMeta.customer_id == c.id).first()

        results.append(SiteSummary(
            customer_id=c.id,
            website_url=c.website_url,
            site_identifier=c.site_identifier,
            pages_indexed=site_config.pages_indexed if site_config else 0,
            crawl_status=latest_job.status if latest_job else "unknown",
            created_at=c.created_at,
            municipality_name=meta.municipality_name if meta else "",
            entity_type=meta.entity_type if meta else "",
        ))

    return results
