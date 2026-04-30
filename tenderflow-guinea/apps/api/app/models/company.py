"""TenderFlow Guinea — CompanyProfile and Reference Models."""
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CompanyProfile(Base):
    """Profile of the tenant's company used for matching and document generation."""
    __tablename__ = "company_profiles"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    activities: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # List of activity descriptions
    sectors: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # List of sectors
    specializations: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # List of specializations

    past_clients: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    references: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    countries: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # List of country codes
    regions: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # List of regions covered

    team_size_range: Mapped[str | None] = mapped_column(String(50), nullable=True)  # e.g. "10-50"
    certifications: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    technical_capabilities: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    logistical_capabilities: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    partners: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    standard_documents: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # Paths to reusable docs
    response_templates: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    expert_cvs: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    reference_library: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="company_profile")
    project_references = relationship("Reference", back_populates="company_profile", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<CompanyProfile {self.company_name}>"


class Reference(Base):
    """A past project reference for the company."""
    __tablename__ = "references"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    company_profile_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("company_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    project_name: Mapped[str] = mapped_column(String(500), nullable=False)
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    year: Mapped[int | None] = mapped_column(nullable=True)
    value: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="GNF")
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    company_profile = relationship("CompanyProfile", back_populates="project_references")

    def __repr__(self) -> str:
        return f"<Reference {self.project_name}>"
