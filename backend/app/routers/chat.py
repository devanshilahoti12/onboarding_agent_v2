from fastapi import APIRouter, Header, HTTPException
from sqlalchemy.orm import Session
from fastapi import Depends
from fastapi.responses import JSONResponse

from ..database import get_db
from ..models import ApiKey, Customer, SiteConfig
from ..schemas.chat import ChatRequest, ChatResponse, SourceRef
from ..services.rag_service import answer

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _get_customer_by_api_key(api_key_value: str, db: Session):
    api_key = db.query(ApiKey).filter(
        ApiKey.key_value == api_key_value, ApiKey.is_active == True
    ).first()
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key.customer


@router.post("/message", response_model=ChatResponse)
def chat_message(
    body: ChatRequest,
    x_api_key: str = Header(..., alias="X-API-Key"),
    db: Session = Depends(get_db),
):
    customer = _get_customer_by_api_key(x_api_key, db)

    site_config = db.query(SiteConfig).filter(
        SiteConfig.customer_id == customer.id
    ).first()
    if not site_config:
        raise HTTPException(status_code=404, detail="Knowledge base not found for this site")

    history = [{"role": t.role, "content": t.content} for t in body.conversation_history]

    reply_text, sources = answer(
        message=body.message,
        kb_identifier=site_config.kb_identifier,
        website_url=customer.website_url,
        conversation_history=history,
    )

    return ChatResponse(
        reply=reply_text,
        sources=[SourceRef(url=s["url"], title=s["title"]) for s in sources],
    )
