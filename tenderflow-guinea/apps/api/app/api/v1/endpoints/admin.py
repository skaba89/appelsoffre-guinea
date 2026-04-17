"""
TenderFlow Guinea — Admin Endpoints
GET /admin/stats, GET /admin/users, GET /admin/tenants,
CRUD /admin/sources, CRUD /admin/taxonomy, CRUD /admin/scoring
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.deps import get_current_tenant, get_current_membership, pagination_params
from app.models.user import User
from app.models.tenant import Tenant
from app.models.membership import Membership
from app.models.tender import Tender, TenderScore
from app.models.source import Source, SourceRun
from app.models.category import Category, Tag
from app.models.company import CompanyProfile
from app.models.crm import CRMAccount, CRMContact, CRMOpportunity
from app.models.alert import Alert
from app.models.billing import Subscription
from app.schemas.common import PaginatedResponse, APIResponse
from app.schemas.source import SourceCreate, SourceUpdate, SourceResponse
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


async def _require_admin(
    membership: Membership = Depends(get_current_membership),
) -> Membership:
    """Ensure the current user is a super_admin or tenant_admin."""
    if membership.role not in ("super_admin", "tenant_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return membership


@router.get("/stats", response_model=APIResponse[dict])
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _admin: Membership = Depends(_require_admin),
):
    """Get platform statistics for the current tenant."""
    # Count various entities
    tender_count = (await db.execute(
        select(func.count()).select_from(Tender).where(Tender.tenant_id == tenant.id)
    )).scalar() or 0

    active_tender_count = (await db.execute(
        select(func.count()).select_from(Tender).where(
            Tender.tenant_id == tenant.id, Tender.is_active.is_(True)
        )
    )).scalar() or 0

    user_count = (await db.execute(
        select(func.count()).select_from(Membership).where(
            Membership.tenant_id == tenant.id, Membership.is_active.is_(True)
        )
    )).scalar() or 0

    source_count = (await db.execute(
        select(func.count()).select_from(Source).where(Source.tenant_id == tenant.id)
    )).scalar() or 0

    account_count = (await db.execute(
        select(func.count()).select_from(CRMAccount).where(
            CRMAccount.tenant_id == tenant.id, CRMAccount.is_active.is_(True)
        )
    )).scalar() or 0

    contact_count = (await db.execute(
        select(func.count()).select_from(CRMContact).where(
            CRMContact.tenant_id == tenant.id, CRMContact.is_active.is_(True)
        )
    )).scalar() or 0

    opportunity_count = (await db.execute(
        select(func.count()).select_from(CRMOpportunity).where(
            CRMOpportunity.tenant_id == tenant.id, CRMOpportunity.is_active.is_(True)
        )
    )).scalar() or 0

    # Tender status distribution
    status_dist = {}
    status_result = await db.execute(
        select(Tender.status, func.count())
        .where(Tender.tenant_id == tenant.id)
        .group_by(Tender.status)
    )
    for s, c in status_result:
        status_dist[s] = c

    # Strategy recommendation distribution
    strategy_dist = {}
    strategy_result = await db.execute(
        select(Tender.strategy_recommendation, func.count())
        .where(Tender.tenant_id == tenant.id, Tender.strategy_recommendation.isnot(None))
        .group_by(Tender.strategy_recommendation)
    )
    for s, c in strategy_result:
        strategy_dist[s] = c

    return APIResponse(
        success=True,
        message="Statistics retrieved",
        data={
            "tenders": {
                "total": tender_count,
                "active": active_tender_count,
                "by_status": status_dist,
                "by_strategy": strategy_dist,
            },
            "users": user_count,
            "sources": source_count,
            "crm": {
                "accounts": account_count,
                "contacts": contact_count,
                "opportunities": opportunity_count,
            },
            "plan": tenant.plan,
        },
    )


@router.get("/users", response_model=PaginatedResponse[UserResponse])
async def list_admin_users(
    pagination: dict = Depends(pagination_params),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _admin: Membership = Depends(_require_admin),
):
    """List all users in the tenant (admin)."""
    page = pagination["page"]
    page_size = pagination["page_size"]

    total = (await db.execute(
        select(func.count()).select_from(Membership).where(
            Membership.tenant_id == tenant.id, Membership.is_active.is_(True)
        )
    )).scalar() or 0

    offset = (page - 1) * page_size
    result = await db.execute(
        select(Membership)
        .where(Membership.tenant_id == tenant.id, Membership.is_active.is_(True))
        .order_by(Membership.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    memberships = result.scalars().all()

    user_ids = [m.user_id for m in memberships]
    users = []
    if user_ids:
        user_result = await db.execute(select(User).where(User.id.in_(user_ids)))
        users = list(user_result.scalars().all())

    return PaginatedResponse[UserResponse].create(
        items=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/tenants", response_model=list[dict])
async def list_tenants(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _admin: Membership = Depends(_require_admin),
):
    """List all tenants (super_admin only)."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required",
        )

    result = await db.execute(select(Tenant).order_by(Tenant.created_at.desc()))
    tenants = result.scalars().all()
    return [
        {
            "id": str(t.id),
            "name": t.name,
            "slug": t.slug,
            "plan": t.plan,
            "is_active": t.is_active,
            "created_at": t.created_at.isoformat(),
        }
        for t in tenants
    ]


# ── Admin Sources Management ───────────────────────────────────────────

@router.get("/sources", response_model=list[SourceResponse])
async def list_admin_sources(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _admin: Membership = Depends(_require_admin),
):
    """List all sources (admin)."""
    result = await db.execute(
        select(Source).where(Source.tenant_id == tenant.id).order_by(Source.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("/sources", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
async def create_admin_source(
    body: SourceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _admin: Membership = Depends(_require_admin),
):
    """Create a source (admin)."""
    source = Source(tenant_id=tenant.id, **body.model_dump())
    db.add(source)
    await db.flush()
    return source


@router.put("/sources/{source_id}", response_model=SourceResponse)
async def update_admin_source(
    source_id: UUID,
    body: SourceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _admin: Membership = Depends(_require_admin),
):
    """Update a source (admin)."""
    result = await db.execute(
        select(Source).where(Source.id == source_id, Source.tenant_id == tenant.id)
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(source, field, value)
    await db.flush()
    return source


# ── Admin Taxonomy ─────────────────────────────────────────────────────

@router.get("/taxonomy", response_model=list[dict])
async def list_taxonomy(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _admin: Membership = Depends(_require_admin),
):
    """List categories and tags (taxonomy)."""
    # Categories
    cat_result = await db.execute(
        select(Category).where(
            (Category.tenant_id == tenant.id) | (Category.tenant_id.is_(None))
        ).order_by(Category.slug)
    )
    categories = cat_result.scalars().all()

    # Tags
    tag_result = await db.execute(
        select(Tag).where(Tag.tenant_id == tenant.id).order_by(Tag.slug)
    )
    tags = tag_result.scalars().all()

    return [
        {
            "categories": [
                {
                    "id": str(c.id),
                    "name": c.name,
                    "slug": c.slug,
                    "sector": c.sector,
                    "parent_id": str(c.parent_id) if c.parent_id else None,
                    "is_global": c.tenant_id is None,
                }
                for c in categories
            ],
            "tags": [
                {"id": str(t.id), "name": t.name, "slug": t.slug}
                for t in tags
            ],
        }
    ]


@router.post("/taxonomy/categories", status_code=status.HTTP_201_CREATED)
async def create_category(
    name: str,
    slug: str,
    sector: str | None = None,
    parent_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _admin: Membership = Depends(_require_admin),
):
    """Create a category (admin)."""
    category = Category(
        tenant_id=tenant.id,
        name=name,
        slug=slug,
        sector=sector,
        parent_id=parent_id,
    )
    db.add(category)
    await db.flush()
    return {"id": str(category.id), "message": "Category created"}


@router.post("/taxonomy/tags", status_code=status.HTTP_201_CREATED)
async def create_tag(
    name: str,
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _admin: Membership = Depends(_require_admin),
):
    """Create a tag (admin)."""
    tag = Tag(tenant_id=tenant.id, name=name, slug=slug)
    db.add(tag)
    await db.flush()
    return {"id": str(tag.id), "message": "Tag created"}


# ── Admin Scoring Configuration ────────────────────────────────────────

@router.get("/scoring", response_model=APIResponse[dict])
async def get_scoring_config(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _admin: Membership = Depends(_require_admin),
):
    """Get scoring configuration."""
    from app.core.config import settings
    import json

    try:
        weights = json.loads(settings.DEFAULT_PRIORITY_WEIGHTS)
    except (json.JSONDecodeError, TypeError):
        weights = {
            "urgency": 0.25, "value": 0.20,
            "compatibility": 0.25, "feasibility": 0.15, "win_prob": 0.15,
        }

    return APIResponse(
        success=True,
        message="Scoring configuration",
        data={
            "weights": weights,
            "go_threshold": settings.GO_THRESHOLD,
            "go_conditional_threshold": settings.GO_CONDITIONAL_THRESHOLD,
        },
    )


@router.put("/scoring", response_model=APIResponse[dict])
async def update_scoring_config(
    weights: dict | None = None,
    go_threshold: float | None = None,
    go_conditional_threshold: float | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _admin: Membership = Depends(_require_admin),
):
    """Update scoring configuration (stored in tenant settings)."""
    if not tenant.settings:
        tenant.settings = {}

    scoring_config = tenant.settings.get("scoring", {})

    if weights:
        scoring_config["weights"] = weights
    if go_threshold is not None:
        scoring_config["go_threshold"] = go_threshold
    if go_conditional_threshold is not None:
        scoring_config["go_conditional_threshold"] = go_conditional_threshold

    tenant.settings["scoring"] = scoring_config
    await db.flush()

    return APIResponse(
        success=True,
        message="Scoring configuration updated",
        data=scoring_config,
    )
