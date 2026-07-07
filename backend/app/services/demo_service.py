import threading
import uuid
from pathlib import Path
from typing import Optional

_sessions: dict[str, dict] = {}
_WIDGET_PATH = Path(__file__).parent.parent / "static" / "widget" / "igna-chat-widget.js"


def create_session() -> str:
    demo_id = str(uuid.uuid4())
    _sessions[demo_id] = {"status": "starting", "stopped": False}
    return demo_id


def get_status(demo_id: str) -> Optional[str]:
    s = _sessions.get(demo_id)
    return s["status"] if s else None


def stop_session(demo_id: str) -> None:
    s = _sessions.get(demo_id)
    if s:
        s["stopped"] = True


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
        from playwright.sync_api import sync_playwright

        widget_content = _WIDGET_PATH.read_text(encoding="utf-8") if _WIDGET_PATH.exists() else ""

        with sync_playwright() as pw:
            browser = pw.firefox.launch(headless=False)
            page = browser.new_page()

            session["status"] = "opening"
            page.goto(website_url, timeout=30_000, wait_until="domcontentloaded")

            if widget_content:
                page.add_script_tag(content=widget_content)
            else:
                page.add_script_tag(url=f"{script_data['backend_url']}/widget/igna-chat-widget.js")

            page.wait_for_timeout(1500)
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
            page.click(".igna-chat-fab")
            page.wait_for_selector(".igna-chat-panel.igna-open", timeout=5_000)
            page.wait_for_timeout(800)

            for question in questions:
                if session.get("stopped"):
                    break
                page.fill(".igna-chat-input", question)
                page.press(".igna-chat-input", "Enter")
                page.wait_for_selector(".igna-chat-send:not([disabled])", timeout=30_000)
                page.wait_for_timeout(1000)

            if not session.get("stopped"):
                session["status"] = "done"

            while not session.get("stopped"):
                page.wait_for_timeout(500)

            browser.close()

    except Exception as exc:
        session["status"] = "error"
        session["error"] = str(exc)
    finally:
        if session.get("status") != "error":
            session["status"] = "closed"


def start_demo(demo_id: str, website_url: str, script_data: dict, questions: list[str]) -> None:
    t = threading.Thread(
        target=_run_demo,
        args=(demo_id, website_url, script_data, questions),
        daemon=True,
    )
    t.start()
