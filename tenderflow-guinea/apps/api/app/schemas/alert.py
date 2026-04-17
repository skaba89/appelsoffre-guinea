"""TenderFlow Guinea — Alert Pydantic Schemas."""
from datetime import datetime
from pydantic import BaseModel, Field


class AlertCreate(BaseModel):
    alert_type: str = Field(..., pattern=r"^(new_tender|deadline_approaching|high_match|missing_document|custom)$")
    title: str = Field(..., max_length=500)
    message: str | None = None
    filters: dict | None = None
    priority: str = Field(default="medium", pattern=r"^(low|medium|high|critical)$")
    related_tender_id: str | None = None


class AlertResponse(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    alert_type: str
    title: str
    message: str | None
    filters: dict | None
    is_read: bool
    is_email_sent: bool
    priority: str
    related_tender_id: str | None
    created_at: datetime
    read_at: datetime | None

    class Config:
        from_attributes = True


class AlertConfigCreate(BaseModel):
    name: str = Field(..., max_length=255)
    config_type: str = Field(..., pattern=r"^(daily_digest|weekly_digest|instant|custom)$")
    filters: dict | None = None
    is_active: bool = True


class AlertConfigResponse(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    name: str
    config_type: str
    filters: dict | None
    is_active: bool
    last_sent_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
