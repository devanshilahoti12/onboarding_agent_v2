import re
from pydantic import BaseModel, EmailStr, field_validator


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


class DataSourceItem(BaseModel):
    url: str
    type: str = ""
    priority: str = ""
    frequency: str = ""


class DeployWizardRequest(BaseModel):
    # Step 1 — Entity (required for Customer record)
    full_name: str
    work_email: EmailStr
    municipality_name: str = ""
    entity_type: str = ""
    department: str = ""
    technical_contact_email: str = ""
    phone: str = ""

    # Step 2 — Configuration (website_url required for crawl)
    website_url: str
    website_platform: str = ""
    chat_placement: str = "Bottom Right"
    chat_display_name: str = ""
    welcome_message: str = ""
    business_hours: str = ""
    after_hours_message: str = ""

    # Step 3 — Data Sources
    data_sources: list[DataSourceItem] = []

    # Step 4 — Policy
    escalation_email: str = ""
    department_routing: str = ""
    emergency_disclaimer: str = ""
    human_handoff: str = ""
    unsupported_response: str = ""

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
