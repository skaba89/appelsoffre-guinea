"""TenderFlow Guinea — GeneratedPrompt Model."""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Integer, JSON

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class GeneratedPrompt(Base):
    """AI-generated prompt for a specific tender/opportunity use case."""
    __tablename__ = "generated_prompts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    tender_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=True, index=True)

    prompt_type: Mapped[str] = mapped_column(String(100), nullable=False)
    # Types: dao_analysis / technical_memo / financial_offer / company_presentation /
    # project_planning / document_list / oral_defense / partner_search /
    # competition_benchmark / professional_email / custom

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    variables: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    sector: Mapped[str | None] = mapped_column(String(100), nullable=True)

    is_edited: Mapped[bool] = mapped_column(Boolean, default=False)
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_template: Mapped[bool] = mapped_column(Boolean, default=False)
    is_exported: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tender = relationship("Tender", back_populates="generated_prompts")

    def __repr__(self) -> str:
        return f"<GeneratedPrompt {self.prompt_type}: {self.title[:50]}>"
