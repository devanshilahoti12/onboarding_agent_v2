from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class SiteConfig(Base):
    __tablename__ = "site_configs"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False, unique=True)
    kb_identifier: Mapped[str] = mapped_column(String(63), nullable=False)
    pages_indexed: Mapped[int] = mapped_column(Integer, default=0)
    primary_color: Mapped[str] = mapped_column(String(20), default="#1a1a2e")
    accent_color: Mapped[str] = mapped_column(String(20), default="#4f46e5")
    backend_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="site_config")
