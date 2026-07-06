import asyncio
import base64
import threading
import time
import uuid
from pathlib import Path
from typing import Optional

_sessions: dict[str, dict] = {}
_frame_queues: dict[str, asyncio.Queue] = {}
_main_loop: Optional[asyncio.AbstractEventLoop] = None
_WIDGET_PATH = Path(__file__).parent.parent / "static" / "widget" / "igna-chat-widget.js"


def set_event_loop(loop: asyncio.AbstractEventLoop) -> None:
    global _main_loop
    _main_loop = loop


def create_session() -> str:
    demo_id = str(uuid.uuid4())
    _sessions[demo_id] = {"status": "starting", "stopped": False}
    _frame_queues[demo_id] = asyncio.Queue()
    return demo_id


def get_status(demo_id: str) -> Optional[str]:
    s = _sessions.get(demo_id)
    return s["status"] if s else None


def stop_session(demo_id: str) -> None:
    s = _sessions.get(demo_id)
    if s:
        s["stopped"] = True
    _send_sentinel(demo_id)


def _send_sentinel(demo_id: str) -> None:
    if _main_loop and demo_id in _frame_queues:
        asyncio.run_coroutine_threadsafe(
            _frame_queues[demo_id].put(None), _main_loop
        )


def _push_frame(demo_id: str, page) -> None:
    if not _main_loop or demo_id not in _frame_queues:
        return
    try:
        data = page.screenshot(type="jpeg", quality=60)
        b64 = base64.b64encode(data).decode()
        asyncio.run_coroutine_threadsafe(
            _frame_queues[demo_id].put(b64), _main_loop
        )
    except Exception:
        pass


def generate_questions(kb_identifier: str) -> list[str]:
    from .chroma_service import get_or_create_collection
    from ..config import settings
    from openai import AzureOpenAI

    col = get_or_create_collection(kb_identifier)
    result = col.get(limit=8, include=["documents"])
    docs = result.get("documents", [])
    context = "\n\n".join(d for d in (docs or []) if d)[:4000]

    client = AzureOpenAI(
        api_key=settings.AZURE_OPENAI_API_KEY,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
    )
    resp = client.chat.completions.create(
        model=settings.AZURE_OPENAI_CHAT_DEPLOYMENT,
        messages=[
            {
                "role": "system",
                "content": (
                    "You generate natural questions a resident might ask a city or municipal chatbot. "
                    "Return exactly 3 questions, one per line, no numbering, bullets, or extra text."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Based on this website content, write 3 distinct natural questions a resident might ask:\n\n{context}"
                ),
            },
        ],
        temperature=0.7,
        max_tokens=200,
    )
    raw = resp.choices[0].message.content.strip()
    questions = [q.strip() for q in raw.splitlines() if q.strip()][:3]
    while len(questions) < 3:
        questions.append("What services does this municipality offer?")
    return questions


def _run_demo(demo_id: str, website_url: str, script_data: dict, questions: list[str]) -> None:
    session = _sessions[demo_id]
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

        widget_content = _WIDGET_PATH.read_text(encoding="utf-8") if _WIDGET_PATH.exists() else ""

        with sync_playwright() as pw:
            browser = pw.firefox.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            session["status"] = "opening"
            page.goto(website_url, timeout=30_000, wait_until="domcontentloaded")
            _push_frame(demo_id, page)

            if widget_content:
                page.add_script_tag(content=widget_content)
            else:
                page.add_script_tag(url=f"{script_data['backend_url']}/widget/igna-chat-widget.js")

            page.wait_for_timeout(1500)
            _push_frame(demo_id, page)

            page.evaluate(
                """cfg => {
                    if (window.IGNAChat) window.IGNAChat.init({
                        apiKey: cfg.apiKey,
                        siteIdentifier: cfg.siteIdentifier,
                        kbIdentifier: cfg.kbIdentifier,
                        pagesIndexed: cfg.pagesIndexed,
                        backendUrl: cfg.backendUrl,
                        theme: { primaryColor: '#1a1a2e', accentColor: '#0ea5e9' }
                    });
                }""",
                {
                    "apiKey": script_data["api_key"],
                    "siteIdentifier": script_data["site_identifier"],
                    "kbIdentifier": script_data["kb_identifier"],
                    "pagesIndexed": script_data["pages_indexed"],
                    "backendUrl": script_data["backend_url"],
                },
            )

            session["status"] = "running"
            page.wait_for_selector(".igna-chat-fab", timeout=10_000)
            _push_frame(demo_id, page)
            page.click(".igna-chat-fab")
            page.wait_for_selector(".igna-chat-panel.igna-open", timeout=5_000)
            page.wait_for_timeout(800)
            _push_frame(demo_id, page)

            for question in questions:
                if session.get("stopped"):
                    break

                page.fill(".igna-chat-input", question)
                _push_frame(demo_id, page)
                page.press(".igna-chat-input", "Enter")
                _push_frame(demo_id, page)

                # Poll for AI response with a screenshot each second so the
                # client sees the typing indicator live while waiting.
                deadline = time.time() + 30
                while time.time() < deadline:
                    if session.get("stopped"):
                        break
                    try:
                        page.wait_for_selector(".igna-chat-send:not([disabled])", timeout=1000)
                        _push_frame(demo_id, page)
                        break
                    except PWTimeout:
                        _push_frame(demo_id, page)

                page.wait_for_timeout(1000)
                _push_frame(demo_id, page)

            if not session.get("stopped"):
                session["status"] = "done"

            # Keep streaming until the presenter clicks Stop
            while not session.get("stopped"):
                page.wait_for_timeout(500)
                _push_frame(demo_id, page)

            browser.close()

    except Exception as exc:
        session["status"] = "error"
        session["error"] = str(exc)
    finally:
        if session.get("status") != "error":
            session["status"] = "closed"
        _send_sentinel(demo_id)


def start_demo(demo_id: str, website_url: str, script_data: dict, questions: list[str]) -> None:
    t = threading.Thread(
        target=_run_demo,
        args=(demo_id, website_url, script_data, questions),
        daemon=True,
    )
    t.start()
