from datetime import datetime
from pydantic import BaseModel


class CrawlStatusResponse(BaseModel):
    job_id: str
    status: str
    pages_crawled: int
    pages_indexed: int
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
