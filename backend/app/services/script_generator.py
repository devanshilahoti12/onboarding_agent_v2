from pathlib import Path

# services/ → app/ → backend/ → igna-chat-platform/ → chatbot/
_TEMPLATE_PATH = Path(__file__).parent.parent.parent.parent / "chatbot" / "igna-chat.js.tpl"


def generate_script(
    api_key: str,
    site_identifier: str,
    kb_identifier: str,
    pages_indexed: int,
    backend_url: str,
    primary_color: str = "#1a1a2e",
    accent_color: str = "#4f46e5",
) -> str:
    template = _TEMPLATE_PATH.read_text(encoding="utf-8")
    # Use plain replacement — avoids .format() choking on JS curly braces
    return (
        template
        .replace("__API_KEY__", api_key)
        .replace("__SITE_IDENTIFIER__", site_identifier)
        .replace("__KB_IDENTIFIER__", kb_identifier)
        .replace("__PAGES_INDEXED__", str(pages_indexed))
        .replace("__BACKEND_URL__", backend_url.rstrip("/"))
        .replace("__PRIMARY_COLOR__", primary_color)
        .replace("__ACCENT_COLOR__", accent_color)
    )
