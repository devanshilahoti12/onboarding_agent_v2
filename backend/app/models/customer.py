from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    work_email: Mapped[str] = mapped_column(String(255), nullable=False)
    website_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    site_identifier: Mapped[str] = mapped_column(String(63), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="customers")
    api_key: Mapped["ApiKey"] = relationship("ApiKey", back_populates="customer", uselist=False)
    site_config: Mapped["SiteConfig"] = relationship("SiteConfig", back_populates="customer", uselist=False)
    crawl_jobs: Mapped[list["CrawlJob"]] = relationship("CrawlJob", back_populates="customer")
