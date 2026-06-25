import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import ApiKey, Customer, SiteConfig, User
from ..schemas.script import ScriptResponse
from ..services.script_generator import generate_script

router = APIRouter(prefix="/api/script", tags=["script"])


def _get_customer_or_404(customer_id: int, user_id: int, db: Session) -> Customer:
    customer = db.query(Customer).filter(
        Customer.id == customer_id, Customer.user_id == user_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.get("/{customer_id}", response_model=ScriptResponse)
def get_script(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = _get_customer_or_404(customer_id, current_user.id, db)

    site_config = db.query(SiteConfig).filter(SiteConfig.customer_id == customer_id).first()
    if not site_config:
        raise HTTPException(status_code=404, detail="Site not yet indexed. Complete onboarding first.")

    api_key = db.query(ApiKey).filter(ApiKey.customer_id == customer_id).first()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    script_content = generate_script(
        api_key=api_key.key_value,
        site_identifier=customer.site_identifier,
        kb_identifier=site_config.kb_identifier,
        pages_indexed=site_config.pages_indexed,
        backend_url=site_config.backend_url,
        primary_color=site_config.primary_color,
        accent_color=site_config.accent_color,
    )

    return ScriptResponse(
        script_content=script_content,
        filename="igna-chat.js",
        site_identifier=customer.site_identifier,
        api_key=api_key.key_value,
        kb_identifier=site_config.kb_identifier,
        pages_indexed=site_config.pages_indexed,
        website_url=customer.website_url,
    )


@router.get("/{customer_id}/download")
def download_script(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = _get_customer_or_404(customer_id, current_user.id, db)

    site_config = db.query(SiteConfig).filter(SiteConfig.customer_id == customer_id).first()
    if not site_config:
        raise HTTPException(status_code=404, detail="Site not yet indexed.")

    api_key = db.query(ApiKey).filter(ApiKey.customer_id == customer_id).first()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    script_content = generate_script(
        api_key=api_key.key_value,
        site_identifier=customer.site_identifier,
        kb_identifier=site_config.kb_identifier,
        pages_indexed=site_config.pages_indexed,
        backend_url=site_config.backend_url,
        primary_color=site_config.primary_color,
        accent_color=site_config.accent_color,
    )

    return StreamingResponse(
        io.BytesIO(script_content.encode("utf-8")),
        media_type="application/javascript",
        headers={"Content-Disposition": "attachment; filename=igna-chat.js"},
    )
