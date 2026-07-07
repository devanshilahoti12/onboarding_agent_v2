from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import ApiKey, Customer, SiteConfig, User
from ..services import demo_service

router = APIRouter(prefix="/api/demo", tags=["demo"])


class DemoStartRequest(BaseModel):
    customer_id: int


class DemoStartResponse(BaseModel):
    demo_id: str
    questions: list[str]


class DemoStatusResponse(BaseModel):
    status: str
    error: str | None = None


@router.post("/start", response_model=DemoStartResponse)
def start_demo(
    body: DemoStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.id == body.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    site_config = db.query(SiteConfig).filter(SiteConfig.customer_id == body.customer_id).first()
    if not site_config:
        raise HTTPException(status_code=404, detail="Site not yet crawled — knowledge base unavailable")

    api_key_obj = db.query(ApiKey).filter(ApiKey.customer_id == body.customer_id).first()
    if not api_key_obj:
        raise HTTPException(status_code=404, detail="API key not found")

    questions = demo_service.generate_questions(site_config.kb_identifier)

    demo_id = demo_service.create_session()
    script_data = {
        "api_key": api_key_obj.key_value,
        "site_identifier": customer.site_identifier,
        "kb_identifier": site_config.kb_identifier,
        "pages_indexed": site_config.pages_indexed,
        "backend_url": site_config.backend_url,
    }
    demo_service.start_demo(demo_id, customer.website_url, script_data, questions)

    return DemoStartResponse(demo_id=demo_id, questions=questions)


@router.get("/{demo_id}/status", response_model=DemoStatusResponse)
def get_demo_status(
    demo_id: str,
    current_user: User = Depends(get_current_user),
):
    session = demo_service._sessions.get(demo_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Demo session not found")
    return DemoStatusResponse(status=session["status"], error=session.get("error"))


@router.post("/{demo_id}/stop")
def stop_demo(
    demo_id: str,
    current_user: User = Depends(get_current_user),
):
    demo_service.stop_session(demo_id)
    return {"ok": True}
