import asyncio
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware


class PrivateNetworkAccessMiddleware(BaseHTTPMiddleware):
    """Respond to Chrome's Private Network Access preflight so localhost can be
    reached from any public origin (needed for widget console injection testing)."""

    async def dispatch(self, request: Request, call_next):
        if (
            request.method == "OPTIONS"
            and "access-control-request-private-network" in request.headers
        ):
            resp = Response(status_code=204)
            resp.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
            resp.headers["Access-Control-Allow-Private-Network"] = "true"
            resp.headers["Access-Control-Allow-Methods"] = "*"
            resp.headers["Access-Control-Allow-Headers"] = "*"
            return resp

        response = await call_next(request)
        response.headers["Access-Control-Allow-Private-Network"] = "true"
        return response

from .database import Base, engine
from .models import ApiKey, CrawlJob, Customer, DeploymentMeta, SiteConfig, User  # noqa: F401 — ensures tables are registered
from .routers import agents, auth, chat, crawl, demo, onboarding, script
from .services import demo_service

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NJ Civic AI Exchange", version="1.0.0")

app.add_middleware(PrivateNetworkAccessMiddleware)

# Platform UI origins — JWT-protected routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # * required so the widget works on any third-party domain
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(onboarding.router)
app.include_router(agents.router)
app.include_router(crawl.router)
app.include_router(script.router)
app.include_router(chat.router)
app.include_router(demo.router)

# Serve the shared widget JS from /widget/
_widget_dir = Path(__file__).parent / "static" / "widget"
_widget_dir.mkdir(parents=True, exist_ok=True)

# Copy widget from chatbot/ if not already present
# __file__ = igna-chat-platform/backend/app/main.py → 3 parents = igna-chat-platform/
_chatbot_widget = Path(__file__).parent.parent.parent / "chatbot" / "igna-chat-widget.js"
_dest_widget = _widget_dir / "igna-chat-widget.js"
if _chatbot_widget.exists() and not _dest_widget.exists():
    _dest_widget.write_bytes(_chatbot_widget.read_bytes())

app.mount("/widget", StaticFiles(directory=str(_widget_dir)), name="widget")


@app.on_event("startup")
async def on_startup():
    demo_service.set_event_loop(asyncio.get_running_loop())


@app.get("/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
