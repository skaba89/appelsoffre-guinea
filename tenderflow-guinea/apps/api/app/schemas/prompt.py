"""TenderFlow Guinea — Prompt Pydantic Schemas."""
from datetime import datetime
from pydantic import BaseModel, Field


class GeneratedPromptCreate(BaseModel):
    tender_id: str | None = None
    prompt_type: str = Field(..., pattern=r"^(dao_analysis|technical_memo|financial_offer|company_presentation|project_planning|document_list|oral_defense|partner_search|competition_benchmark|professional_email|custom)$")
    title: str = Field(..., max_length=500)
    prompt_text: str
    variables: dict | None = None
    sector: str | None = None
    is_template: bool = False


class GeneratedPromptUpdate(BaseModel):
    title: str | None = None
    prompt_text: str | None = None
    variables: dict | None = None
    sector: str | None = None
    is_edited: bool | None = None
    is_template: bool | None = None


class GeneratedPromptResponse(BaseModel):
    id: str
    tenant_id: str
    tender_id: str | None
    prompt_type: str
    title: str
    prompt_text: str
    variables: dict | None
    sector: str | None
    is_edited: bool
    version: int
    is_template: bool
    is_exported: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
