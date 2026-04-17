"""TenderFlow Guinea — Source Pydantic Schemas."""
from datetime import datetime
from pydantic import BaseModel, Field


class SourceCreate(BaseModel):
    name: str = Field(..., max_length=255)
    url: str
    source_type: str = Field(..., pattern=r"^(html|pdf|rss|email|manual)$")
    config: dict | None = None
    frequency_minutes: int = Field(default=360, ge=10)
    is_active: bool = True


class SourceUpdate(BaseModel):
    name: str | None = None
    url: str | None = None
    source_type: str | None = None
    config: dict | None = None
    frequency_minutes: int | None = None
    is_active: bool | None = None


class SourceResponse(BaseModel):
    id: str
    tenant_id: str
    name: str
    url: str
    source_type: str
    config: dict | None
    frequency_minutes: int
    is_active: bool
    last_run_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SourceRunResponse(BaseModel):
    id: str
    source_id: str
    status: str
    started_at: datetime | None
    completed_at: datetime | None
    items_found: int
    items_new: int
    error_message: str | None
    created_at: datetime

    class Config:
        from_attributes = True
