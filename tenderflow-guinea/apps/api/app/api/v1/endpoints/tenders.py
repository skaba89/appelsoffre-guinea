"""
TenderFlow Guinea — Tender Endpoints
GET /tenders (with filters, pagination, search), GET /tenders/{id},
POST /tenders, PUT /tenders/{id}, POST /tenders/{id}/score, POST /tenders/{id}/match
"""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.deps import get_current_tenant, get_current_membership, pagination_params, require_permission
from app.models.tender import Tender, TenderScore
from app.models.tenant import Tenant
from app.models.user import User
from app.models.membership import Membership
from app.schemas.tender import (
    TenderCreate,
    TenderUpdate,
    TenderResponse,
    TenderListResponse,
    TenderDetailResponse,
    TenderScoreResponse,
)
from app.schemas.common import PaginatedResponse, APIResponse

router = APIRouter(prefix="/tenders", tags=["Tenders"])


@router.get("/", response_model=PaginatedResponse[TenderListResponse])
async def list_tenders(
    pagination: dict = Depends(pagination_params),
    status_filter: str | None = Query(None, alias="status", description="Filter by status"),
    tender_type: str | None = Query(None, description="Filter by tender type"),
    sector: str | None = Query(None, description="Filter by sector"),
    region: str | None = Query(None, description="Filter by region"),
    strategy: str | None = Query(None, description="Filter by strategy recommendation"),
    search: str | None = Query(None, description="Search in title, reference, organization"),
    min_budget: Decimal | None = Query(None, description="Minimum budget"),
    max_budget: Decimal | None = Query(None, description="Maximum budget"),
    is_active: bool | None = Query(True, description="Filter by active status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("tenders.read")),
):
    """List tenders with filters, pagination, and full-text search."""
    page = pagination["page"]
    page_size = pagination["page_size"]

    base_q = select(Tender).where(Tender.tenant_id == tenant.id)
    count_q = select(func.count()).select_from(Tender).where(Tender.tenant_id == tenant.id)

    if status_filter:
        base_q = base_q.where(Tender.status == status_filter)
        count_q = count_q.where(Tender.status == status_filter)
    if tender_type:
        base_q = base_q.where(Tender.tender_type == tender_type)
        count_q = count_q.where(Tender.tender_type == tender_type)
    if sector:
        base_q = base_q.where(Tender.sector == sector)
        count_q = count_q.where(Tender.sector == sector)
    if region:
        base_q = base_q.where(Tender.region == region)
        count_q = count_q.where(Tender.region == region)
    if strategy:
        base_q = base_q.where(Tender.strategy_recommendation == strategy)
        count_q = count_q.where(Tender.strategy_recommendation == strategy)
    if is_active is not None:
        base_q = base_q.where(Tender.is_active == is_active)
        count_q = count_q.where(Tender.is_active == is_active)
    if min_budget is not None:
        base_q = base_q.where(Tender.budget_estimated >= min_budget)
        count_q = count_q.where(Tender.budget_estimated >= min_budget)
    if max_budget is not None:
        base_q = base_q.where(Tender.budget_estimated <= max_budget)
        count_q = count_q.where(Tender.budget_estimated <= max_budget)
    if search:
        search_pattern = f"%{search}%"
        search_filter = or_(
            Tender.title.ilike(search_pattern),
            Tender.reference.ilike(search_pattern),
            Tender.organization.ilike(search_pattern),
            Tender.description.ilike(search_pattern),
        )
        base_q = base_q.where(search_filter)
        count_q = count_q.where(search_filter)

    total = (await db.execute(count_q)).scalar() or 0

    offset = (page - 1) * page_size
    q = base_q.order_by(Tender.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(q)
    tenders = result.scalars().all()

    return PaginatedResponse[TenderListResponse].create(
        items=[TenderListResponse.model_validate(t) for t in tenders],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{tender_id}", response_model=TenderDetailResponse)
async def get_tender(
    tender_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("tenders.read")),
):
    """Get a specific tender with full details."""
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tender not found")
    return tender


@router.post("/", response_model=TenderResponse, status_code=status.HTTP_201_CREATED)
async def create_tender(
    body: TenderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("tenders.create")),
):
    """Create a new tender."""
    tender = Tender(
        tenant_id=tenant.id,
        source_id=body.source_id,
        reference=body.reference,
        title=body.title,
        description=body.description,
        tender_type=body.tender_type,
        organization=body.organization,
        sector=body.sector,
        subsector=body.subsector,
        category_id=body.category_id,
        publication_date=body.publication_date,
        deadline_date=body.deadline_date,
        budget_estimated=body.budget_estimated,
        currency=body.currency,
        location=body.location,
        region=body.region,
        status=body.status,
        lots=body.lots or [],
    )
    db.add(tender)
    await db.flush()
    return tender


@router.put("/{tender_id}", response_model=TenderResponse)
async def update_tender(
    tender_id: UUID,
    body: TenderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("tenders.update")),
):
    """Update a tender."""
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tender not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tender, field, value)

    await db.flush()
    return tender


@router.post("/{tender_id}/score", response_model=APIResponse[dict])
async def score_tender(
    tender_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("tenders.score")),
):
    """Calculate and store scores for a tender."""
    from app.services.scoring import (
        calculate_priority_score,
        calculate_compatibility_score,
        calculate_feasibility_score,
        calculate_win_probability,
        get_strategy_recommendation,
    )
    from app.models.company import CompanyProfile

    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tender not found")

    # Get company profile
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    company = result.scalar_one_or_none()

    # Calculate scores
    priority = calculate_priority_score(tender)
    compatibility = calculate_compatibility_score(tender, company) if company else 0.0
    feasibility = calculate_feasibility_score(tender, company) if company else 0.0
    win_prob = calculate_win_probability(tender, company) if company else 0.0

    # Update tender scores
    tender.priority_score = priority
    tender.compatibility_score = compatibility
    tender.feasibility_score = feasibility
    tender.win_probability = win_prob

    # Determine strategy
    scores = {
        "priority": priority,
        "compatibility": compatibility,
        "feasibility": feasibility,
        "win_probability": win_prob,
    }
    strategy = get_strategy_recommendation(scores)
    tender.strategy_recommendation = strategy

    # Store individual scores
    score_types = {
        "relevance": compatibility,
        "urgency": priority,
        "complexity": feasibility,
        "size": float(tender.budget_estimated or 0) / 1_000_000,
        "win_prob": win_prob,
        "doc_risk": 0.5,  # Placeholder
    }
    now = datetime.now()
    for score_type, score_value in score_types.items():
        # Check if score already exists
        existing_result = await db.execute(
            select(TenderScore).where(
                TenderScore.tender_id == tender.id,
                TenderScore.score_type == score_type,
            )
        )
        existing = existing_result.scalar_one_or_none()
        if existing:
            existing.score_value = score_value
            existing.calculated_at = now
        else:
            score = TenderScore(
                tender_id=tender.id,
                score_type=score_type,
                score_value=score_value,
                weight=1.0,
                calculated_at=now,
            )
            db.add(score)

    await db.flush()

    return APIResponse(
        success=True,
        message="Tender scored successfully",
        data={
            "priority_score": priority,
            "compatibility_score": compatibility,
            "feasibility_score": feasibility,
            "win_probability": win_prob,
            "strategy_recommendation": strategy,
        },
    )


@router.post("/{tender_id}/match", response_model=APIResponse[dict])
async def match_tender(
    tender_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("tenders.score")),
):
    """Match a tender against the company profile and return detailed analysis."""
    from app.services.matching import match_tender_to_profile
    from app.models.company import CompanyProfile

    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tender not found")

    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found. Please create one first.",
        )

    match_result = match_tender_to_profile(tender, company)
    return APIResponse(
        success=True,
        message="Matching completed",
        data=match_result,
    )
