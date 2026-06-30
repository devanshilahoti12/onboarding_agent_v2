import asyncio
import re
import secrets
import uuid
from urllib.parse import urlparse

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import ApiKey, CrawlJob, Customer, DeploymentMeta, User
from ..schemas.customer import DeployWizardRequest, OnboardingResponse
from ..services.crawler_service import run_crawl_pipeline

router = APIRouter(prefix="/api/agents", tags=["agents"])


def _make_site_identifier(url: str) -> str:
    netloc = urlparse(url).netloc.lower()
    netloc = re.sub(r"^www\.", "", netloc)
    slug = re.sub(r"[^a-z0-9]+", "-", netloc).strip("-")
    return slug[:50]


def _run_crawl(job_id: str, website_url: str, site_identifier: str, customer_id: int, additional_urls: list[str]):
    asyncio.run(run_crawl_pipeline(job_id, website_url, site_identifier, customer_id, additional_urls))


@router.post("/deploy", response_model=OnboardingResponse, status_code=202)
def deploy_agent(
    body: DeployWizardRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site_identifier = _make_site_identifier(body.website_url)

    # Customer record
    customer = Customer(
        user_id=current_user.id,
        full_name=body.full_name,
        work_email=str(body.work_email),
        website_url=body.website_url,
        site_identifier=site_identifier,
    )
    db.add(customer)
    db.flush()

    # API key
    api_key = ApiKey(customer_id=customer.id, key_value=secrets.token_urlsafe(32))
    db.add(api_key)

    # Crawl job
    job_id = str(uuid.uuid4())
    crawl_job = CrawlJob(
        job_id=job_id,
        customer_id=customer.id,
        website_url=body.website_url,
        status="queued",
    )
    db.add(crawl_job)

    # Deployment metadata — all wizard fields beyond basic crawl info
    additional_urls = [ds.url for ds in body.data_sources if ds.url.strip()]
    meta = DeploymentMeta(
        customer_id=customer.id,
        municipality_name=body.municipality_name,
        entity_type=body.entity_type,
        department=body.department,
        technical_contact_email=body.technical_contact_email,
        phone=body.phone,
        website_platform=body.website_platform,
        chat_placement=body.chat_placement,
        chat_display_name=body.chat_display_name,
        welcome_message=body.welcome_message,
        business_hours=body.business_hours,
        after_hours_message=body.after_hours_message,
        additional_urls="\n".join(additional_urls),
        escalation_email=body.escalation_email,
        department_routing=body.department_routing,
        emergency_disclaimer=body.emergency_disclaimer,
        human_handoff=body.human_handoff,
        unsupported_response=body.unsupported_response,
    )
    db.add(meta)
    db.commit()
    db.refresh(customer)

    # Fire background crawl (includes Step-3 additional URLs)
    background_tasks.add_task(
        _run_crawl, job_id, body.website_url, site_identifier, customer.id, additional_urls
    )

    return OnboardingResponse(
        job_id=job_id,
        customer_id=customer.id,
        site_identifier=site_identifier,
        status="queued",
    )
