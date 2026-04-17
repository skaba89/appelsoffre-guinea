"""TenderFlow Guinea — Tender Endpoints."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.deps import get_current_tenant, PaginationParams
from app.models.user import User
from app.models.tenant import Tenant
from app.models.tender import Tender, TenderDocument, TenderScore
from app.models.company import CompanyProfile
from app.schemas.tender import (
    TenderCreate, TenderUpdate, TenderResponse, TenderListResponse, TenderDetailResponse,
    TenderDocumentResponse, TenderScoreResponse,
)
from app.schemas.common import PaginatedResponse, APIResponse
from app.services.scoring import calculate_all_scores
from app.services.matching import match_tender_to_profile

router = APIRouter(prefix="/tenders", tags=["Tenders"])


@router.get("", response_model=PaginatedResponse[TenderListResponse])
async def list_tenders(
    pagination: PaginationParams = Depends(),
    search: str | None = Query(None, description="Recherche plein texte"),
    sector: str | None = Query(None),
    region: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    tender_type: str | None = Query(None),
    strategy: str | None = Query(None, description="Stratégie: go/go_conditional/no_go"),
    min_score: float | None = Query(None, description="Score minimum"),
    sort_by: str | None = Query("created_at"),
    sort_order: str | None = Query("desc"),
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List tenders with filtering, search, and pagination."""
    query = select(Tender).where(Tender.tenant_id == tenant.id, Tender.is_active == True)
    count_query = select(func.count()).select_from(Tender).where(
        Tender.tenant_id == tenant.id, Tender.is_active == True
    )

    # Apply filters
    if search:
        search_filter = or_(
            Tender.title.ilike(f"%{search}%"),
            Tender.reference.ilike(f"%{search}%"),
            Tender.description.ilike(f"%{search}%"),
            Tender.organization.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if sector:
        query = query.where(Tender.sector == sector)
        count_query = count_query.where(Tender.sector == sector)
    if region:
        query = query.where(Tender.region == region)
        count_query = count_query.where(Tender.region == region)
    if status_filter:
        query = query.where(Tender.status == status_filter)
        count_query = count_query.where(Tender.status == status_filter)
    if tender_type:
        query = query.where(Tender.tender_type == tender_type)
        count_query = count_query.where(Tender.tender_type == tender_type)
    if strategy:
        query = query.where(Tender.strategy_recommendation == strategy)
        count_query = count_query.where(Tender.strategy_recommendation == strategy)
    if min_score is not None:
        query = query.where(Tender.priority_score >= min_score)
        count_query = count_query.where(Tender.priority_score >= min_score)

    total = (await db.execute(count_query)).scalar() or 0

    # Sorting
    sort_column = getattr(Tender, sort_by, Tender.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    query = query.offset(pagination.offset).limit(pagination.limit)
    result = await db.execute(query)
    tenders = result.scalars().all()

    return PaginatedResponse(
        items=tenders,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        total_pages=(total + pagination.page_size - 1) // pagination.page_size if total else 0,
    )


@router.post("", response_model=TenderResponse, status_code=status.HTTP_201_CREATED)
async def create_tender(
    body: TenderCreate,
    user: User = Depends(require_role("tenant_admin", "analyst", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create a new tender manually."""
    tender = Tender(
        tenant_id=tenant.id,
        **body.model_dump(),
    )
    db.add(tender)
    await db.flush()
    return tender


@router.get("/{tender_id}", response_model=TenderDetailResponse)
async def get_tender(
    tender_id: str,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information about a tender."""
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="Appel d'offres introuvable")

    # Build detail response with related data
    doc_result = await db.execute(
        select(TenderDocument).where(TenderDocument.tender_id == tender_id)
    )
    documents = doc_result.scalars().all()

    score_result = await db.execute(
        select(TenderScore).where(TenderScore.tender_id == tender_id)
    )
    scores = score_result.scalars().all()

    tags = [{"id": link.tag.id, "name": link.tag.name, "slug": link.tag.slug}
            for link in tender.tag_links] if tender.tag_links else []

    response = TenderDetailResponse.model_validate(tender)
    response.documents = [TenderDocumentResponse.model_validate(d) for d in documents]
    response.scores = [TenderScoreResponse.model_validate(s) for s in scores]
    response.tags = tags

    return response


@router.put("/{tender_id}", response_model=TenderResponse)
async def update_tender(
    tender_id: str,
    body: TenderUpdate,
    user: User = Depends(require_role("tenant_admin", "analyst", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Update a tender."""
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="Appel d'offres introuvable")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tender, key, value)
    await db.flush()
    return tender


@router.delete("/{tender_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tender(
    tender_id: str,
    user: User = Depends(require_role("tenant_admin", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a tender (deactivate)."""
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="Appel d'offres introuvable")
    tender.is_active = False
    await db.flush()


@router.post("/{tender_id}/score", response_model=APIResponse[dict])
async def score_tender(
    tender_id: str,
    user: User = Depends(require_role("tenant_admin", "analyst", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Calculate and save scores for a tender."""
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="Appel d'offres introuvable")

    # Get company profile
    profile_result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    profile = profile_result.scalar_one_or_none()

    # Calculate all scores
    scores = calculate_all_scores(tender, profile)

    # Update tender with composite scores
    tender.priority_score = scores["priority"]
    tender.compatibility_score = scores["relevance"]
    tender.feasibility_score = 1.0 - scores["doc_risk"]
    tender.win_probability = scores["win_prob"]
    tender.strategy_recommendation = scores["strategy_recommendation"]

    # Save individual scores
    for score_type, score_value in scores.items():
        if score_type in ("priority", "strategy_recommendation"):
            continue
        # Delete existing score of this type
        await db.execute(
            TenderScore.__table__.delete().where(
                TenderScore.tender_id == tender_id,
                TenderScore.score_type == score_type,
            )
        )
        await db.flush()

        new_score = TenderScore(
            tender_id=tender_id,
            score_type=score_type,
            score_value=score_value,
            weight=1.0,
            calculated_at=datetime.now(timezone.utc),
        )
        db.add(new_score)

    await db.flush()

    return APIResponse(success=True, data=scores, message="Scores calculés avec succès")


@router.post("/{tender_id}/match", response_model=APIResponse[dict])
async def match_tender(
    tender_id: str,
    user: User = Depends(require_role("tenant_admin", "analyst", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Match a tender against the company profile."""
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="Appel d'offres introuvable")

    profile_result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    profile = profile_result.scalar_one_or_none()

    match_result = await match_tender_to_profile(tender, profile)
    return APIResponse(success=True, data=match_result)


@router.get("/dashboard/stats", response_model=APIResponse[dict])
async def get_dashboard_stats(
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard statistics for the current tenant."""
    now = datetime.now(timezone.utc)

    # Total tenders
    total = (await db.execute(
        select(func.count()).select_from(Tender).where(
            Tender.tenant_id == tenant.id, Tender.is_active == True
        )
    )).scalar() or 0

    # New today
    new_today = (await db.execute(
        select(func.count()).select_from(Tender).where(
            Tender.tenant_id == tenant.id,
            Tender.is_active == True,
            Tender.created_at >= now.replace(hour=0, minute=0, second=0),
        )
    )).scalar() or 0

    # By status
    by_status_result = await db.execute(
        select(Tender.status, func.count())
        .where(Tender.tenant_id == tenant.id, Tender.is_active == True)
        .group_by(Tender.status)
    )
    by_status = dict(by_status_result.all())

    # By sector
    by_sector_result = await db.execute(
        select(Tender.sector, func.count())
        .where(Tender.tenant_id == tenant.id, Tender.is_active == True, Tender.sector != None)
        .group_by(Tender.sector)
    )
    by_sector = dict(by_sector_result.all())

    # By strategy
    by_strategy_result = await db.execute(
        select(Tender.strategy_recommendation, func.count())
        .where(Tender.tenant_id == tenant.id, Tender.is_active == True, Tender.strategy_recommendation != None)
        .group_by(Tender.strategy_recommendation)
    )
    by_strategy = dict(by_strategy_result.all())

    # Approaching deadline (within 7 days)
    from datetime import timedelta
    deadline_soon = (await db.execute(
        select(func.count()).select_from(Tender).where(
            Tender.tenant_id == tenant.id,
            Tender.is_active == True,
            Tender.deadline_date != None,
            Tender.deadline_date <= now + timedelta(days=7),
            Tender.deadline_date >= now,
        )
    )).scalar() or 0

    # Average scores
    avg_priority = (await db.execute(
        select(func.avg(Tender.priority_score))
        .where(Tender.tenant_id == tenant.id, Tender.is_active == True)
    )).scalar() or 0

    return APIResponse(success=True, data={
        "total_tenders": total,
        "new_today": new_today,
        "by_status": by_status,
        "by_sector": by_sector,
        "by_strategy": by_strategy,
        "deadline_soon": deadline_soon,
        "avg_priority_score": round(float(avg_priority), 2),
    })
