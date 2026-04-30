"""TenderFlow Guinea — Tender Pydantic Schemas."""
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class TenderCreate(BaseModel):
    reference: str = Field(..., max_length=100)
    title: str = Field(..., max_length=500)
    description: str | None = None
    tender_type: str = Field(default="public", pattern=r"^(public|private)$")
    organization: str | None = None
    sector: str | None = None
    subsector: str | None = None
    category_id: str | None = None
    publication_date: datetime | None = None
    deadline_date: datetime | None = None
    budget_estimated: Decimal | None = None
    currency: str = "GNF"
    location: str | None = None
    region: str | None = None
    lots: dict | None = None


class TenderUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    tender_type: str | None = None
    organization: str | None = None
    sector: str | None = None
    subsector: str | None = None
    category_id: str | None = None
    publication_date: datetime | None = None
    deadline_date: datetime | None = None
    budget_estimated: Decimal | None = None
    currency: str | None = None
    location: str | None = None
    region: str | None = None
    status: str | None = None
    lots: dict | None = None
    ai_summary: str | None = None
    strategy_recommendation: str | None = None
    checklist_items: dict | None = None
    conformity_matrix: dict | None = None
    clarification_questions: dict | None = None
    is_active: bool | None = None


class TenderScoreResponse(BaseModel):
    id: str
    score_type: str
    score_value: float
    weight: float
    details: dict | None
    calculated_at: datetime

    class Config:
        from_attributes = True


class TenderDocumentResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    is_parsed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TenderResponse(BaseModel):
    id: str
    tenant_id: str
    reference: str
    title: str
    description: str | None
    tender_type: str
    organization: str | None
    sector: str | None
    subsector: str | None
    publication_date: datetime | None
    deadline_date: datetime | None
    budget_estimated: Decimal | None
    currency: str
    location: str | None
    region: str | None
    status: str
    priority_score: float
    compatibility_score: float
    feasibility_score: float
    win_probability: float
    ai_summary: str | None
    strategy_recommendation: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TenderListResponse(BaseModel):
    id: str
    reference: str
    title: str
    tender_type: str
    organization: str | None
    sector: str | None
    deadline_date: datetime | None
    budget_estimated: Decimal | None
    currency: str
    status: str
    priority_score: float
    compatibility_score: float
    strategy_recommendation: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class TenderDetailResponse(TenderResponse):
    lots: dict | None
    checklist_items: dict | None
    conformity_matrix: dict | None
    clarification_questions: dict | None
    documents: list[TenderDocumentResponse] = []
    scores: list[TenderScoreResponse] = []
    tags: list[dict] = []
