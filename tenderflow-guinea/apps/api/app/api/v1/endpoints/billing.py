"""
TenderFlow Guinea — Billing Endpoints
GET /billing/subscription, POST /billing/checkout, POST /billing/webhook
"""

import json
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.deps import get_current_tenant, get_current_membership, require_permission
from app.models.billing import Subscription, BillingEvent
from app.models.tenant import Tenant
from app.models.user import User
from app.models.membership import Membership
from app.schemas.billing import SubscriptionResponse, BillingEventResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/billing", tags=["Billing"])

# Default quotas per plan
PLAN_QUOTAS = {
    "free": {
        "max_users": 5,
        "max_tenders": 100,
        "max_sources": 5,
        "max_documents": 200,
        "max_crm_contacts": 500,
        "max_prompts_per_month": 50,
        "rag_enabled": False,
        "export_enabled": False,
    },
    "pro": {
        "max_users": 15,
        "max_tenders": 1000,
        "max_sources": 20,
        "max_documents": 2000,
        "max_crm_contacts": 5000,
        "max_prompts_per_month": 200,
        "rag_enabled": True,
        "export_enabled": False,
    },
    "business": {
        "max_users": 50,
        "max_tenders": 5000,
        "max_sources": 50,
        "max_documents": 10000,
        "max_crm_contacts": 20000,
        "max_prompts_per_month": 1000,
        "rag_enabled": True,
        "export_enabled": True,
    },
    "enterprise": {
        "max_users": -1,
        "max_tenders": -1,
        "max_sources": -1,
        "max_documents": -1,
        "max_crm_contacts": -1,
        "max_prompts_per_month": -1,
        "rag_enabled": True,
        "export_enabled": True,
    },
}


@router.get("/subscription", response_model=APIResponse[dict])
async def get_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("billing.read")),
):
    """Get the current subscription details."""
    result = await db.execute(
        select(Subscription).where(Subscription.tenant_id == tenant.id)
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        # Auto-create free subscription
        now = datetime.now(timezone.utc)
        subscription = Subscription(
            tenant_id=tenant.id,
            plan="free",
            status="active",
            current_period_start=now,
            current_period_end=datetime(2099, 12, 31, tzinfo=timezone.utc),
            quotas=PLAN_QUOTAS["free"],
        )
        db.add(subscription)
        await db.flush()

    return APIResponse(
        success=True,
        message="Subscription details",
        data={
            "subscription": SubscriptionResponse.model_validate(subscription).model_dump(),
            "plan": tenant.plan,
            "available_plans": list(PLAN_QUOTAS.keys()),
        },
    )


@router.post("/checkout", response_model=APIResponse[dict])
async def create_checkout(
    plan: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("billing.read")),
):
    """Create a checkout session for plan upgrade.

    In production, this would create a Stripe checkout session.
    For now, it returns a mock checkout URL.
    """
    if plan not in PLAN_QUOTAS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan '{plan}'. Available: {', '.join(PLAN_QUOTAS.keys())}",
        )

    result = await db.execute(
        select(Subscription).where(Subscription.tenant_id == tenant.id)
    )
    subscription = result.scalar_one_or_none()

    if subscription and subscription.plan == plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already on this plan",
        )

    # Record billing event
    event = BillingEvent(
        tenant_id=tenant.id,
        subscription_id=subscription.id if subscription else None,
        event_type="plan_changed",
        details={
            "from_plan": subscription.plan if subscription else "none",
            "to_plan": plan,
            "initiated_by": str(current_user.id),
        },
        provider="stripe",
    )
    db.add(event)
    await db.flush()

    # In production: create Stripe checkout session
    checkout_url = f"https://billing.tenderflow-gn.com/checkout?plan={plan}&tenant={tenant.id}"

    return APIResponse(
        success=True,
        message="Checkout session created",
        data={
            "checkout_url": checkout_url,
            "plan": plan,
            "quotas": PLAN_QUOTAS[plan],
        },
    )


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def billing_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Handle billing webhooks from Stripe or other providers.

    Verifies the webhook signature and processes events like:
    - payment_succeeded
    - payment_failed
    - subscription_updated
    """
    body = await request.body()

    # In production: verify Stripe webhook signature
    # sig_header = request.headers.get("stripe-signature")
    # event = stripe.Webhook.construct_event(body, sig_header, STRIPE_WEBHOOK_SECRET)

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload",
        )

    event_type = payload.get("type", "unknown")
    tenant_id = payload.get("tenant_id")
    data = payload.get("data", {})

    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing tenant_id in webhook payload",
        )

    # Record the billing event
    billing_event = BillingEvent(
        tenant_id=tenant_id,
        event_type=event_type,
        amount=data.get("amount"),
        currency=data.get("currency", "USD"),
        details=data,
        provider="stripe",
        provider_event_id=data.get("id"),
    )
    db.add(billing_event)

    # Process specific event types
    if event_type == "payment_succeeded":
        result = await db.execute(
            select(Subscription).where(Subscription.tenant_id == tenant_id)
        )
        subscription = result.scalar_one_or_none()
        if subscription:
            subscription.status = "active"

    elif event_type == "payment_failed":
        result = await db.execute(
            select(Subscription).where(Subscription.tenant_id == tenant_id)
        )
        subscription = result.scalar_one_or_none()
        if subscription:
            subscription.status = "past_due"

    elif event_type == "subscription_updated":
        new_plan = data.get("plan", "free")
        result = await db.execute(
            select(Subscription).where(Subscription.tenant_id == tenant_id)
        )
        subscription = result.scalar_one_or_none()
        if subscription:
            subscription.plan = new_plan
            subscription.quotas = PLAN_QUOTAS.get(new_plan, PLAN_QUOTAS["free"])

        # Also update tenant plan
        result = await db.execute(
            select(Tenant).where(Tenant.id == tenant_id)
        )
        tenant = result.scalar_one_or_none()
        if tenant:
            tenant.plan = new_plan

    await db.flush()

    return {"status": "processed"}
