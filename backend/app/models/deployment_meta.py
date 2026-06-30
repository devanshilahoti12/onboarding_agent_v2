from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class DeploymentMeta(Base):
    __tablename__ = "deployment_meta"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False, unique=True)

    # Step 1 — Entity
    municipality_name: Mapped[str] = mapped_column(String(255), default="")
    entity_type: Mapped[str] = mapped_column(String(100), default="")
    department: Mapped[str] = mapped_column(String(255), default="")
    technical_contact_email: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str] = mapped_column(String(50), default="")

    # Step 2 — Configuration
    website_platform: Mapped[str] = mapped_column(String(100), default="")
    chat_placement: Mapped[str] = mapped_column(String(100), default="")
    chat_display_name: Mapped[str] = mapped_column(String(255), default="")
    welcome_message: Mapped[str] = mapped_column(Text, default="")
    business_hours: Mapped[str] = mapped_column(String(255), default="")
    after_hours_message: Mapped[str] = mapped_column(Text, default="")

    # Step 3 — Additional data source URLs (newline-separated)
    additional_urls: Mapped[str] = mapped_column(Text, default="")

    # Step 4 — Policy
    escalation_email: Mapped[str] = mapped_column(String(255), default="")
    department_routing: Mapped[str] = mapped_column(Text, default="")
    emergency_disclaimer: Mapped[str] = mapped_column(Text, default="")
    human_handoff: Mapped[str] = mapped_column(Text, default="")
    unsupported_response: Mapped[str] = mapped_column(Text, default="")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    customer: Mapped["Customer"] = relationship("Customer")
