from pydantic import BaseModel, EmailStr, field_validator
import re


class OnboardingRequest(BaseModel):
    full_name: str
    work_email: EmailStr
    website_url: str

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be empty")
        return v.strip()

    @field_validator("website_url")
    @classmethod
    def valid_url(cls, v: str) -> str:
        pattern = re.compile(r"^https?://[^\s/$.?#].[^\s]*$", re.IGNORECASE)
        if not pattern.match(v):
            raise ValueError("Must be a valid http or https URL")
        return v.rstrip("/")


class OnboardingResponse(BaseModel):
    job_id: str
    customer_id: int
    site_identifier: str
    status: str
