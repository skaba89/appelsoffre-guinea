"""TenderFlow Guinea — Source Endpoints."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.deps import get_current_tenant, PaginationParams
from app.models.user import User
from app.models.tenant import Tenant
from app.models.source import Source, SourceRun
from app.schemas.source import SourceCreate, SourceUpdate, SourceResponse, SourceRunResponse
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/sources", tags=["Sources"])


@router.get("", response_model=PaginatedResponse[SourceResponse])
async def list_sources(
    pagination: PaginationParams = Depends(),
    active_only: bool = Query(False),
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List all sources for the current tenant."""
    query = select(Source).where(Source.tenant_id == tenant.id)
    if active_only:
        query = query.where(Source.is_active == True)

    # Count total
    count_query = select(func.count()).select_from(Source).where(Source.tenant_id == tenant.id)
    if active_only:
        count_query = count_query.where(Source.is_active == True)
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate
    query = query.offset(pagination.offset).limit(pagination.limit).order_by(Source.created_at.desc())
    result = await db.execute(query)
    sources = result.scalars().all()

    return PaginatedResponse(
        items=sources,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        total_pages=(total + pagination.page_size - 1) // pagination.page_size,
    )


@router.post("", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
async def create_source(
    body: SourceCreate,
    user: User = Depends(require_role("tenant_admin", "analyst")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create a new source configuration."""
    source = Source(
        tenant_id=tenant.id,
        name=body.name,
        url=body.url,
        source_type=body.source_type,
        config=body.config,
        frequency_minutes=body.frequency_minutes,
        is_active=body.is_active,
    )
    db.add(source)
    await db.flush()
    return source


@router.get("/{source_id}", response_model=SourceResponse)
async def get_source(
    source_id: str,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get a source by ID."""
    result = await db.execute(
        select(Source).where(Source.id == source_id, Source.tenant_id == tenant.id)
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source introuvable")
    return source


@router.put("/{source_id}", response_model=SourceResponse)
async def update_source(
    source_id: str,
    body: SourceUpdate,
    user: User = Depends(require_role("tenant_admin", "analyst")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Update a source configuration."""
    result = await db.execute(
        select(Source).where(Source.id == source_id, Source.tenant_id == tenant.id)
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source introuvable")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(source, key, value)
    await db.flush()
    return source


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_source(
    source_id: str,
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Delete (deactivate) a source."""
    result = await db.execute(
        select(Source).where(Source.id == source_id, Source.tenant_id == tenant.id)
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source introuvable")
    source.is_active = False
    await db.flush()


@router.get("/{source_id}/runs", response_model=PaginatedResponse[SourceRunResponse])
async def list_source_runs(
    source_id: str,
    pagination: PaginationParams = Depends(),
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List run history for a source."""
    count_query = select(func.count()).select_from(SourceRun).where(SourceRun.source_id == source_id)
    total = (await db.execute(count_query)).scalar() or 0

    query = (
        select(SourceRun)
        .where(SourceRun.source_id == source_id)
        .offset(pagination.offset)
        .limit(pagination.limit)
        .order_by(SourceRun.created_at.desc())
    )
    result = await db.execute(query)
    runs = result.scalars().all()

    return PaginatedResponse(
        items=runs,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        total_pages=(total + pagination.page_size - 1) // pagination.page_size,
    )


@router.post("/{source_id}/trigger", response_model=SourceRunResponse)
async def trigger_source_run(
    source_id: str,
    user: User = Depends(require_role("tenant_admin", "analyst")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger a crawl run for a source."""
    result = await db.execute(
        select(Source).where(Source.id == source_id, Source.tenant_id == tenant.id)
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source introuvable")

    run = SourceRun(
        source_id=source_id,
        status="pending",
        started_at=datetime.now(timezone.utc),
    )
    db.add(run)
    await db.flush()

    # In production, this would enqueue a Celery task
    # For now, mark as running
    run.status = "running"
    await db.flush()

    return run
