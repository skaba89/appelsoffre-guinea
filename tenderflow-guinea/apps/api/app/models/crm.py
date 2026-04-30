"""TenderFlow Guinea — CRM Models.

IMPORTANT COMPLIANCE NOTE:
All contact fields are strictly limited to PROFESSIONAL, PUBLIC, and TRACEABLE data.
No personal emails, personal phone numbers, or private information is ever stored.
Every contact must have a source_url and source_label for traceability.
"""
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Float, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CRMAccount(Base):
    """Organization account in the CRM (buyers, companies, partners, competitors)."""
    __tablename__ = "crm_accounts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(500), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False, default="company")
    # Types: buyer / company / partner / competitor

    sector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)
    website: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(10), default="GN")

    is_public_buyer: Mapped[bool] = mapped_column(Boolean, default=False)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_label: Mapped[str | None] = mapped_column(String(255), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="crm_accounts")
    contacts = relationship("CRMContact", back_populates="account", lazy="selectin", cascade="all, delete-orphan")
    opportunities = relationship("CRMOpportunity", back_populates="account", lazy="selectin")
    interactions = relationship("CRMInteraction", back_populates="account", lazy="noload")
    notes = relationship("CRMNote", back_populates="account", lazy="noload")

    def __repr__(self) -> str:
        return f"<CRMAccount {self.name} ({self.type})>"


class CRMContact(Base):
    """Professional contact in the CRM — PROFESSIONAL DATA ONLY.

    COMPLIANCE: Only professional/public contact information is stored.
    - professional_email must be an institutional or publicly listed email
    - professional_phone must be a publicly listed professional number
    - No personal email addresses or personal phone numbers
    - Every record must be traceable to a public source (source_url, source_label)
    """
    __tablename__ = "crm_contacts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("crm_accounts.id", ondelete="SET NULL"), nullable=True, index=True)

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    job_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    responsibility: Mapped[str | None] = mapped_column(String(255), nullable=True)
    organization_name: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # PROFESSIONAL CONTACT INFO ONLY — never personal
    professional_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    professional_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    institutional_page: Mapped[str | None] = mapped_column(Text, nullable=True)
    linkedin_public: Mapped[str | None] = mapped_column(Text, nullable=True)  # Only if publicly available

    # Traceability — MANDATORY for compliance
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    collection_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    validation_status: Mapped[str] = mapped_column(String(50), default="pending")  # pending / verified / rejected

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("CRMAccount", back_populates="contacts")
    opportunities = relationship("CRMOpportunity", back_populates="contact", lazy="selectin")
    interactions = relationship("CRMInteraction", back_populates="contact", lazy="noload")
    notes = relationship("CRMNote", back_populates="contact", lazy="noload")

    def __repr__(self) -> str:
        return f"<CRMContact {self.first_name} {self.last_name} ({self.job_title})>"


class CRMOpportunity(Base):
    """Sales/engagement opportunity linked to CRM accounts and tenders."""
    __tablename__ = "crm_opportunities"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("crm_accounts.id", ondelete="SET NULL"), nullable=True, index=True)
    tender_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("tenders.id", ondelete="SET NULL"), nullable=True, index=True)
    contact_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("crm_contacts.id", ondelete="SET NULL"), nullable=True)

    name: Mapped[str] = mapped_column(String(500), nullable=False)
    stage: Mapped[str] = mapped_column(String(50), default="prospecting")
    # Stages: prospecting / qualification / proposal / negotiation / won / lost

    amount: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="GNF")
    probability: Mapped[float] = mapped_column(Float, default=0.0)
    assigned_to: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    close_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("CRMAccount", back_populates="opportunities")
    contact = relationship("CRMContact", back_populates="opportunities")
    interactions = relationship("CRMInteraction", back_populates="opportunity", lazy="selectin")
    tasks = relationship("CRMTask", back_populates="opportunity", lazy="selectin")
    assignee = relationship("User", lazy="selectin")

    def __repr__(self) -> str:
        return f"<CRMOpportunity {self.name} ({self.stage})>"


class CRMInteraction(Base):
    """Record of interaction with a CRM contact or account."""
    __tablename__ = "crm_interactions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("crm_opportunities.id", ondelete="SET NULL"), nullable=True, index=True)
    contact_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("crm_contacts.id", ondelete="SET NULL"), nullable=True)
    account_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("crm_accounts.id", ondelete="SET NULL"), nullable=True)

    interaction_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: email / phone / meeting / note / document

    subject: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    created_by: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    opportunity = relationship("CRMOpportunity", back_populates="interactions")
    contact = relationship("CRMContact", back_populates="interactions")
    account = relationship("CRMAccount", back_populates="interactions")

    def __repr__(self) -> str:
        return f"<CRMInteraction {self.interaction_type}: {self.subject}>"


class CRMTask(Base):
    """Task linked to a CRM opportunity."""
    __tablename__ = "crm_tasks"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("crm_opportunities.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_to: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    priority: Mapped[str] = mapped_column(String(50), default="medium")  # low / medium / high / urgent
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending / in_progress / completed / cancelled

    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    opportunity = relationship("CRMOpportunity", back_populates="tasks")
    assignee = relationship("User", lazy="selectin")

    def __repr__(self) -> str:
        return f"<CRMTask {self.title} ({self.status})>"


class CRMNote(Base):
    """Note attached to CRM entities."""
    __tablename__ = "crm_notes"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("crm_accounts.id", ondelete="CASCADE"), nullable=True, index=True)
    contact_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("crm_contacts.id", ondelete="CASCADE"), nullable=True, index=True)
    opportunity_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("crm_opportunities.id", ondelete="CASCADE"), nullable=True, index=True)

    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_by: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("CRMAccount", back_populates="notes")
    contact = relationship("CRMContact", back_populates="notes")
    opportunity = relationship("CRMOpportunity", lazy="selectin")

    def __repr__(self) -> str:
        return f"<CRMNote {self.id[:8]}>"
