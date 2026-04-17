"""TenderFlow Guinea — Billing Pydantic Schemas."""
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class SubscriptionResponse(BaseModel):
    id: str
    tenant_id: str
    plan: str
    status: str
    current_period_start: datetime | None
    current_period_end: datetime | None
    trial_end: datetime | None
    cancelled_at: datetime | None
    quotas: dict | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BillingEventResponse(BaseModel):
    id: str
    tenant_id: str
    subscription_id: str | None
    event_type: str
    amount: Decimal | None
    currency: str
    details: dict | None
    provider: str
    provider_event_id: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    plan: str
    success_url: str
    cancel_url: str
