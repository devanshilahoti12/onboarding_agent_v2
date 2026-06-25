from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import CrawlJob, Customer, User
from ..schemas.crawl import CrawlStatusResponse

router = APIRouter(prefix="/api/crawl", tags=["crawl"])


@router.get("/{job_id}/status", response_model=CrawlStatusResponse)
def get_crawl_status(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(CrawlJob).filter(CrawlJob.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Crawl job not found")

    # Verify job belongs to this user
    customer = db.query(Customer).filter(
        Customer.id == job.customer_id, Customer.user_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=403, detail="Access denied")

    return CrawlStatusResponse(
        job_id=job.job_id,
        status=job.status,
        pages_crawled=job.pages_crawled,
        pages_indexed=job.pages_indexed,
        error_message=job.error_message,
        started_at=job.started_at,
        completed_at=job.completed_at,
    )
