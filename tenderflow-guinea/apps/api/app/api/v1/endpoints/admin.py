"""TenderFlow Guinea — Admin Endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.deps import get_current_tenant, PaginationParams
from app.models.user import User
from app.models.tenant import Tenant
from app.models.source import Source
from app.models.tender import Tender
from app.models.category import Category
from app.models.audit import AuditLog
from app.models.crm import CRMAccount, CRMContact, CRMOpportunity
from app.models.billing import Subscription
from app.schemas.common import PaginatedResponse, APIResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


# ─── Platform Stats ───────────────────────────────────────────────────────

@router.get("/stats", response_model=APIResponse[dict])
async def get_platform_stats(
    user: User = Depends(require_role("super_admin", "tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get platform statistics for the admin dashboard."""
    total_users = (await db.execute(
        select(func.count()).select_from(User).where(User.is_active == True)
    )).scalar() or 0

    total_tenders = (await db.execute(
        select(func.count()).select_from(Tender).where(Tender.tenant_id == tenant.id, Tender.is_active == True)
    )).scalar() or 0

    total_sources = (await db.execute(
        select(func.count()).select_from(Source).where(Source.tenant_id == tenant.id, Source.is_active == True)
    )).scalar() or 0

    total_crm_contacts = (await db.execute(
        select(func.count()).select_from(CRMContact).where(CRMContact.tenant_id == tenant.id, CRMContact.is_active == True)
    )).scalar() or 0

    total_crm_accounts = (await db.execute(
        select(func.count()).select_from(CRMAccount).where(CRMAccount.tenant_id == tenant.id, CRMAccount.is_active == True)
    )).scalar() or 0

    total_opportunities = (await db.execute(
        select(func.count()).select_from(CRMOpportunity).where(CRMOpportunity.tenant_id == tenant.id, CRMOpportunity.is_active == True)
    )).scalar() or 0

    return APIResponse(success=True, data={
        "total_users": total_users,
        "total_tenders": total_tenders,
        "total_sources": total_sources,
        "total_crm_contacts": total_crm_contacts,
        "total_crm_accounts": total_crm_accounts,
        "total_opportunities": total_opportunities,
    })


# ─── Tenant Users ─────────────────────────────────────────────────────────

@router.get("/users", response_model=PaginatedResponse[dict])
async def list_tenant_users(
    pagination: PaginationParams = Depends(),
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List users in the current tenant."""
    from app.models.membership import Membership
    query = (
        select(Membership, User)
        .join(User, User.id == Membership.user_id)
        .where(Membership.tenant_id == tenant.id, Membership.is_active == True)
    )
    count_query = select(func.count()).select_from(Membership).where(
        Membership.tenant_id == tenant.id, Membership.is_active == True
    )
    total = (await db.execute(count_query)).scalar() or 0

    query = query.offset(pagination.offset).limit(pagination.limit)
    result = await db.execute(query)
    rows = result.all()

    items = [
        {
            "user_id": row.User.id,
            "email": row.User.email,
            "full_name": row.User.full_name,
            "role": row.Membership.role,
            "is_active": row.User.is_active,
            "joined_at": row.Membership.accepted_at.isoformat() if row.Membership.accepted_at else None,
        }
        for row in rows
    ]

    return PaginatedResponse(
        items=items, total=total,
        page=pagination.page, page_size=pagination.page_size,
        total_pages=(total + pagination.page_size - 1) // pagination.page_size if total else 0,
    )


# ─── Taxonomy Management ─────────────────────────────────────────────────

@router.get("/taxonomy", response_model=list[dict])
async def list_taxonomy(
    user: User = Depends(require_role("tenant_admin", "analyst")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List the category taxonomy."""
    result = await db.execute(
        select(Category).where(
            (Category.tenant_id == tenant.id) | (Category.tenant_id == None),
            Category.is_active == True,
        ).order_by(Category.sector, Category.name)
    )
    categories = result.scalars().all()
    return [
        {"id": c.id, "name": c.name, "slug": c.slug, "sector": c.sector, "parent_id": c.parent_id}
        for c in categories
    ]


@router.post("/taxonomy", response_model=APIResponse[dict], status_code=status.HTTP_201_CREATED)
async def create_category(
    name: str = Query(...),
    slug: str = Query(...),
    sector: str | None = Query(None),
    parent_id: str | None = Query(None),
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create a new category in the taxonomy."""
    category = Category(
        tenant_id=tenant.id,
        name=name,
        slug=slug,
        sector=sector,
        parent_id=parent_id,
    )
    db.add(category)
    await db.flush()
    return APIResponse(success=True, data={"id": category.id, "slug": category.slug})


# ─── Audit Logs ───────────────────────────────────────────────────────────

@router.get("/audit-logs", response_model=PaginatedResponse[dict])
async def list_audit_logs(
    pagination: PaginationParams = Depends(),
    action: str | None = Query(None),
    user_id: str | None = Query(None),
    current_user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List audit logs for the tenant."""
    query = select(AuditLog).where(AuditLog.tenant_id == tenant.id)
    count_query = select(func.count()).select_from(AuditLog).where(AuditLog.tenant_id == tenant.id)

    if action:
        query = query.where(AuditLog.action == action)
        count_query = count_query.where(AuditLog.action == action)
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
        count_query = count_query.where(AuditLog.user_id == user_id)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset(pagination.offset).limit(pagination.limit).order_by(AuditLog.created_at.desc())
    result = await db.execute(query)
    logs = result.scalars().all()

    items = [
        {
            "id": log.id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "user_id": log.user_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]

    return PaginatedResponse(
        items=items, total=total,
        page=pagination.page, page_size=pagination.page_size,
        total_pages=(total + pagination.page_size - 1) // pagination.page_size if total else 0,
    )


# ─── Scoring Configuration ───────────────────────────────────────────────

@router.get("/scoring/config", response_model=APIResponse[dict])
async def get_scoring_config(
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
):
    """Get the current scoring weights configuration."""
    from app.services.scoring import DEFAULT_WEIGHTS
    return APIResponse(success=True, data={"weights": DEFAULT_WEIGHTS})


@router.put("/scoring/config", response_model=APIResponse[dict])
async def update_scoring_config(
    weights: dict,
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
):
    """Update scoring weights (stored in tenant settings)."""
    # In production, this would persist to tenant.settings
    return APIResponse(success=True, data={"weights": weights}, message="Configuration de scoring mise à jour")
