"""TenderFlow Guinea — Billing Endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.deps import get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.models.billing import Subscription, BillingEvent, PLAN_QUOTAS
from app.schemas.billing import SubscriptionResponse, BillingEventResponse, CheckoutRequest
from app.schemas.common import APIResponse

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get the current subscription for the tenant."""
    result = await db.execute(
        select(Subscription).where(Subscription.tenant_id == tenant.id)
    )
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=404, detail="Aucun abonnement trouvé")
    return subscription


@router.get("/quotas", response_model=APIResponse[dict])
async def get_quotas(
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get the effective quotas for the current plan."""
    result = await db.execute(
        select(Subscription).where(Subscription.tenant_id == tenant.id)
    )
    subscription = result.scalar_one_or_none()
    if not subscription:
        return APIResponse(success=True, data=PLAN_QUOTAS["free"])

    quotas = subscription.get_effective_quotas()
    return APIResponse(success=True, data=quotas)


@router.get("/plans", response_model=APIResponse[dict])
async def list_plans():
    """List all available plans with their quotas."""
    return APIResponse(success=True, data={
        plan: {
            "name": plan.title(),
            "quotas": quotas,
        }
        for plan, quotas in PLAN_QUOTAS.items()
    })


@router.post("/checkout", response_model=APIResponse[dict])
async def create_checkout(
    body: CheckoutRequest,
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Initiate a checkout session for a plan upgrade."""
    if body.plan not in PLAN_QUOTAS:
        raise HTTPException(status_code=400, detail="Plan invalide")

    # In production, this would create a Stripe checkout session
    # For now, return a placeholder response
    return APIResponse(success=True, data={
        "checkout_url": f"https://billing.tenderflow.local/checkout?plan={body.plan}&tenant={tenant.id}",
        "plan": body.plan,
    }, message="Session de paiement initiée")


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def billing_webhook(
    payload: dict,
    db: AsyncSession = Depends(get_db),
):
    """Webhook endpoint for billing provider (Stripe, etc.).

    Processes billing events and updates subscription status.
    """
    event_type = payload.get("type", "unknown")

    # In production, verify webhook signature
    # For now, log the event
    tenant_id = payload.get("tenant_id")
    if not tenant_id:
        return {"status": "ignored"}

    # Create billing event record
    billing_event = BillingEvent(
        tenant_id=tenant_id,
        event_type=event_type,
        details=payload,
        provider=payload.get("provider", "stripe"),
        provider_event_id=payload.get("id"),
    )
    db.add(billing_event)

    # Handle specific event types
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

    elif event_type == "plan_changed":
        new_plan = payload.get("new_plan", "free")
        result = await db.execute(
            select(Subscription).where(Subscription.tenant_id == tenant_id)
        )
        subscription = result.scalar_one_or_none()
        if subscription:
            subscription.plan = new_plan

    await db.flush()
    return {"status": "processed"}


@router.get("/events", response_model=list[BillingEventResponse])
async def list_billing_events(
    limit: int = 20,
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List recent billing events."""
    result = await db.execute(
        select(BillingEvent)
        .where(BillingEvent.tenant_id == tenant.id)
        .order_by(BillingEvent.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()
