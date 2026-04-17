"""TenderFlow Guinea — Company Profile Pydantic Schemas."""
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class CompanyProfileCreate(BaseModel):
    company_name: str = Field(..., max_length=255)
    description: str | None = None
    activities: list[str] | None = None
    sectors: list[str] | None = None
    specializations: list[str] | None = None
    past_clients: list[str] | None = None
    references: list[dict] | None = None
    countries: list[str] | None = None
    regions: list[str] | None = None
    team_size_range: str | None = None
    certifications: list[str] | None = None
    technical_capabilities: list[str] | None = None
    logistical_capabilities: list[str] | None = None
    partners: list[dict] | None = None
    standard_documents: list[dict] | None = None
    response_templates: list[dict] | None = None
    expert_cvs: list[dict] | None = None
    reference_library: list[dict] | None = None


class CompanyProfileUpdate(BaseModel):
    company_name: str | None = None
    description: str | None = None
    activities: list[str] | None = None
    sectors: list[str] | None = None
    specializations: list[str] | None = None
    past_clients: list[str] | None = None
    references: list[dict] | None = None
    countries: list[str] | None = None
    regions: list[str] | None = None
    team_size_range: str | None = None
    certifications: list[str] | None = None
    technical_capabilities: list[str] | None = None
    logistical_capabilities: list[str] | None = None
    partners: list[dict] | None = None
    standard_documents: list[dict] | None = None
    response_templates: list[dict] | None = None
    expert_cvs: list[dict] | None = None
    reference_library: list[dict] | None = None


class CompanyProfileResponse(BaseModel):
    id: str
    tenant_id: str
    company_name: str
    description: str | None
    activities: dict | None
    sectors: dict | None
    specializations: dict | None
    past_clients: dict | None
    references: dict | None
    countries: dict | None
    regions: dict | None
    team_size_range: str | None
    certifications: dict | None
    technical_capabilities: dict | None
    logistical_capabilities: dict | None
    partners: dict | None
    standard_documents: dict | None
    response_templates: dict | None
    expert_cvs: dict | None
    reference_library: dict | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReferenceCreate(BaseModel):
    project_name: str = Field(..., max_length=500)
    client_name: str = Field(..., max_length=255)
    sector: str | None = None
    description: str | None = None
    year: int | None = None
    value: Decimal | None = None
    currency: str = "GNF"
    is_public: bool = True


class ReferenceResponse(BaseModel):
    id: str
    company_profile_id: str
    project_name: str
    client_name: str
    sector: str | None
    description: str | None
    year: int | None
    value: Decimal | None
    currency: str
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True
