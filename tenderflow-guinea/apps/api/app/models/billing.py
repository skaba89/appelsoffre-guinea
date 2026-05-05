"""TenderFlow Guinea — Subscription and BillingEvent Models."""
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Numeric, JSON

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

# Default quotas per plan
PLAN_QUOTAS = {
    "free": {
        "max_users": 2,
        "max_tenders": 50,
        "max_sources": 3,
        "max_documents": 25,
        "max_crm_contacts": 100,
        "max_prompts_per_month": 10,
        "rag_enabled": False,
        "export_enabled": False,
    },
    "pro": {
        "max_users": 10,
        "max_tenders": 500,
        "max_sources": 15,
        "max_documents": 250,
        "max_crm_contacts": 1000,
        "max_prompts_per_month": 100,
        "rag_enabled": True,
        "export_enabled": True,
    },
    "business": {
        "max_users": 50,
        "max_tenders": 5000,
        "max_sources": 50,
        "max_documents": 2500,
        "max_crm_contacts": 10000,
        "max_prompts_per_month": 1000,
        "rag_enabled": True,
        "export_enabled": True,
    },
    "enterprise": {
        "max_users": -1,  # unlimited
        "max_tenders": -1,
        "max_sources": -1,
        "max_documents": -1,
        "max_crm_contacts": -1,
        "max_prompts_per_month": -1,
        "rag_enabled": True,
        "export_enabled": True,
    },
}


class Subscription(Base):
    """Subscription plan for a tenant."""
    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    plan: Mapped[str] = mapped_column(String(50), default="free")  # free / pro / business / enterprise
    status: Mapped[str] = mapped_column(String(50), default="active")  # active / past_due / cancelled / trialing

    current_period_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    trial_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    quotas: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # Overridable quotas

    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    billing_events = relationship("BillingEvent", back_populates="subscription", lazy="noload")

    def get_effective_quotas(self) -> dict:
        """Return the effective quotas, merging plan defaults with overrides."""
        base = PLAN_QUOTAS.get(self.plan, PLAN_QUOTAS["free"]).copy()
        if self.quotas:
            base.update(self.quotas)
        return base

    def __repr__(self) -> str:
        return f"<Subscription {self.plan} ({self.status})>"


class BillingEvent(Base):
    """Record of a billing event (payment, plan change, etc.)."""
    __tablename__ = "billing_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True)

    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    # Types: subscription_created / subscription_updated / payment_succeeded /
    # payment_failed / plan_changed / usage_recorded

    amount: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="GNF")
    details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    provider: Mapped[str] = mapped_column(String(50), default="stripe")
    provider_event_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    subscription = relationship("Subscription", back_populates="billing_events")

    def __repr__(self) -> str:
        return f"<BillingEvent {self.event_type}>"
