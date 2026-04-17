"""TenderFlow Guinea — Tender, TenderDocument, TenderChunk, and TenderScore Models."""
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Integer, Float, Numeric, JSON, Index
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Tender(Base):
    """Represents a public or private call for tenders (appel d'offres)."""
    __tablename__ = "tenders"
    __table_args__ = (
        Index("ix_tenders_tenant_status", "tenant_id", "status"),
        Index("ix_tenders_deadline", "deadline_date"),
        Index("ix_tenders_sector", "sector"),
        Index("ix_tenders_reference", "reference", unique=False),
    )

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("sources.id", ondelete="SET NULL"), nullable=True)

    reference: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    tender_type: Mapped[str] = mapped_column(String(50), default="public")  # public / private
    organization: Mapped[str | None] = mapped_column(String(500), nullable=True)

    sector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    subsector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)

    publication_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deadline_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    budget_estimated: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="GNF")

    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)

    status: Mapped[str] = mapped_column(String(50), default="new")
    # Status flow: new → qualifying → qualified → go/no_go → responding → won/lost/expired

    lots: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # List of lot objects

    priority_score: Mapped[float] = mapped_column(Float, default=0.0)
    compatibility_score: Mapped[float] = mapped_column(Float, default=0.0)
    feasibility_score: Mapped[float] = mapped_column(Float, default=0.0)
    win_probability: Mapped[float] = mapped_column(Float, default=0.0)

    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    strategy_recommendation: Mapped[str | None] = mapped_column(String(50), nullable=True)  # go / go_conditional / no_go

    checklist_items: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    conformity_matrix: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    clarification_questions: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="tenders")
    source = relationship("Source", back_populates="tenders")
    category = relationship("Category", back_populates="tenders", lazy="selectin")
    documents = relationship("TenderDocument", back_populates="tender", lazy="selectin", cascade="all, delete-orphan")
    scores = relationship("TenderScore", back_populates="tender", lazy="selectin", cascade="all, delete-orphan")
    tag_links = relationship("TenderTagLink", back_populates="tender", cascade="all, delete-orphan")
    generated_prompts = relationship("GeneratedPrompt", back_populates="tender", lazy="noload")
    generated_documents = relationship("GeneratedDocument", back_populates="tender", lazy="noload")

    @property
    def tags(self):
        return [link.tag for link in self.tag_links]

    def __repr__(self) -> str:
        return f"<Tender {self.reference}: {self.title[:50]}>"


class TenderDocument(Base):
    """Document attached to a tender (DAO, annexes, specs, etc.)."""
    __tablename__ = "tender_documents"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tender_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0)
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    content_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_parsed: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    tender = relationship("Tender", back_populates="documents")
    chunks = relationship("TenderChunk", back_populates="document", lazy="selectin", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<TenderDocument {self.original_filename}>"


class TenderChunk(Base):
    """Text chunk from a tender document for RAG pipeline."""
    __tablename__ = "tender_chunks"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tender_document_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tender_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list | None] = mapped_column(ARRAY(Float, dimensions=1), nullable=True)
    chunk_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    document = relationship("TenderDocument", back_populates="chunks")

    def __repr__(self) -> str:
        return f"<TenderChunk doc={self.tender_document_id} idx={self.chunk_index}>"


class TenderScore(Base):
    """Calculated score for a tender across different dimensions."""
    __tablename__ = "tender_scores"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tender_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, index=True)
    score_type: Mapped[str] = mapped_column(String(50), nullable=False)  # relevance / urgency / complexity / size / win_prob / doc_risk
    score_value: Mapped[float] = mapped_column(Float, nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    details: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    tender = relationship("Tender", back_populates="scores")

    def __repr__(self) -> str:
        return f"<TenderScore {self.score_type}={self.score_value}>"
