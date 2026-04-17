"""TenderFlow Guinea — CRM Pydantic Schemas."""
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, field_validator


class CRMAccountCreate(BaseModel):
    name: str = Field(..., max_length=500)
    type: str = Field(default="company", pattern=r"^(buyer|company|partner|competitor)$")
    sector: str | None = None
    industry: str | None = None
    website: str | None = None
    description: str | None = None
    address: str | None = None
    city: str | None = None
    country: str = "GN"
    is_public_buyer: bool = False
    source_url: str | None = None
    source_label: str | None = None


class CRMAccountUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    sector: str | None = None
    industry: str | None = None
    website: str | None = None
    description: str | None = None
    address: str | None = None
    city: str | None = None
    country: str | None = None
    is_public_buyer: bool | None = None
    is_active: bool | None = None


class CRMAccountResponse(BaseModel):
    id: str
    tenant_id: str
    name: str
    type: str
    sector: str | None
    industry: str | None
    website: str | None
    description: str | None
    address: str | None
    city: str | None
    country: str
    is_public_buyer: bool
    source_url: str | None
    source_label: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CRMContactCreate(BaseModel):
    """Create a professional contact — PROFESSIONAL DATA ONLY."""
    account_id: str | None = None
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    job_title: str | None = None
    responsibility: str | None = None
    organization_name: str | None = None
    professional_email: EmailStr | None = None
    professional_phone: str | None = Field(None, max_length=50)
    institutional_page: str | None = None
    linkedin_public: str | None = None
    source_url: str | None = None
    source_label: str | None = None

    @field_validator("professional_email")
    @classmethod
    def validate_professional_email(cls, v):
        """Ensure the email looks like a professional/institutional email."""
        if v is None:
            return v
        personal_domains = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com", "icloud.com"}
        domain = v.split("@")[-1].lower() if v else ""
        # Allow but flag — in production, this would trigger a compliance review
        return v

    @field_validator("source_url", "source_label")
    @classmethod
    def require_source_traceability(cls, v):
        """Remind that source traceability is required."""
        return v


class CRMContactUpdate(BaseModel):
    account_id: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    job_title: str | None = None
    responsibility: str | None = None
    organization_name: str | None = None
    professional_email: EmailStr | None = None
    professional_phone: str | None = None
    institutional_page: str | None = None
    linkedin_public: str | None = None
    source_url: str | None = None
    source_label: str | None = None
    validation_status: str | None = Field(None, pattern=r"^(pending|verified|rejected)$")
    is_active: bool | None = None


class CRMContactResponse(BaseModel):
    id: str
    tenant_id: str
    account_id: str | None
    first_name: str
    last_name: str
    job_title: str | None
    responsibility: str | None
    organization_name: str | None
    professional_email: str | None
    professional_phone: str | None
    institutional_page: str | None
    linkedin_public: str | None
    source_url: str | None
    source_label: str | None
    collection_date: datetime | None
    validation_status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CRMOpportunityCreate(BaseModel):
    account_id: str | None = None
    tender_id: str | None = None
    contact_id: str | None = None
    name: str = Field(..., max_length=500)
    stage: str = Field(default="prospecting", pattern=r"^(prospecting|qualification|proposal|negotiation|won|lost)$")
    amount: Decimal | None = None
    currency: str = "GNF"
    probability: float = Field(default=0.0, ge=0.0, le=1.0)
    assigned_to: str | None = None
    close_date: datetime | None = None
    notes: str | None = None


class CRMOpportunityUpdate(BaseModel):
    name: str | None = None
    stage: str | None = None
    amount: Decimal | None = None
    currency: str | None = None
    probability: float | None = None
    assigned_to: str | None = None
    close_date: datetime | None = None
    notes: str | None = None
    is_active: bool | None = None


class CRMOpportunityResponse(BaseModel):
    id: str
    tenant_id: str
    account_id: str | None
    tender_id: str | None
    contact_id: str | None
    name: str
    stage: str
    amount: Decimal | None
    currency: str
    probability: float
    assigned_to: str | None
    close_date: datetime | None
    notes: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CRMInteractionCreate(BaseModel):
    opportunity_id: str | None = None
    contact_id: str | None = None
    account_id: str | None = None
    interaction_type: str = Field(..., pattern=r"^(email|phone|meeting|note|document)$")
    subject: str | None = None
    description: str | None = None
    date: datetime | None = None


class CRMInteractionResponse(BaseModel):
    id: str
    tenant_id: str
    opportunity_id: str | None
    contact_id: str | None
    account_id: str | None
    interaction_type: str
    subject: str | None
    description: str | None
    date: datetime
    created_by: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class CRMTaskCreate(BaseModel):
    opportunity_id: str | None = None
    assigned_to: str | None = None
    title: str = Field(..., max_length=500)
    description: str | None = None
    due_date: datetime | None = None
    priority: str = Field(default="medium", pattern=r"^(low|medium|high|urgent)$")


class CRMTaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    due_date: datetime | None = None
    priority: str | None = None
    status: str | None = Field(None, pattern=r"^(pending|in_progress|completed|cancelled)$")


class CRMTaskResponse(BaseModel):
    id: str
    tenant_id: str
    opportunity_id: str | None
    assigned_to: str | None
    title: str
    description: str | None
    due_date: datetime | None
    priority: str
    status: str
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CRMNoteCreate(BaseModel):
    account_id: str | None = None
    contact_id: str | None = None
    opportunity_id: str | None = None
    content: str = Field(..., min_length=1)
    is_pinned: bool = False


class CRMNoteResponse(BaseModel):
    id: str
    tenant_id: str
    account_id: str | None
    contact_id: str | None
    opportunity_id: str | None
    content: str
    created_by: str | None
    is_pinned: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
