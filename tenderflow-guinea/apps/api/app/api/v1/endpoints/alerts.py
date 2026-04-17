"""TenderFlow Guinea — Alert Endpoints."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.deps import get_current_tenant, PaginationParams
from app.models.user import User
from app.models.tenant import Tenant
from app.models.alert import Alert, AlertConfig
from app.schemas.alert import AlertCreate, AlertResponse, AlertConfigCreate, AlertConfigResponse
from app.schemas.common import PaginatedResponse, APIResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=PaginatedResponse[AlertResponse])
async def list_alerts(
    pagination: PaginationParams = Depends(),
    unread_only: bool = Query(False),
    alert_type: str | None = Query(None),
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List alerts for the current user."""
    query = select(Alert).where(Alert.tenant_id == tenant.id, Alert.user_id == user.id)
    count_query = select(func.count()).select_from(Alert).where(
        Alert.tenant_id == tenant.id, Alert.user_id == user.id
    )

    if unread_only:
        query = query.where(Alert.is_read == False)
        count_query = count_query.where(Alert.is_read == False)
    if alert_type:
        query = query.where(Alert.alert_type == alert_type)
        count_query = count_query.where(Alert.alert_type == alert_type)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset(pagination.offset).limit(pagination.limit).order_by(Alert.created_at.desc())
    result = await db.execute(query)

    return PaginatedResponse(
        items=result.scalars().all(), total=total,
        page=pagination.page, page_size=pagination.page_size,
        total_pages=(total + pagination.page_size - 1) // pagination.page_size if total else 0,
    )


@router.put("/{alert_id}/read", response_model=AlertResponse)
async def mark_alert_read(
    alert_id: str,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Mark an alert as read."""
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.tenant_id == tenant.id, Alert.user_id == user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerte introuvable")
    alert.is_read = True
    alert.read_at = datetime.now(timezone.utc)
    await db.flush()
    return alert


@router.put("/mark-all-read", response_model=APIResponse)
async def mark_all_read(
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Mark all alerts as read."""
    result = await db.execute(
        select(Alert).where(Alert.tenant_id == tenant.id, Alert.user_id == user.id, Alert.is_read == False)
    )
    alerts = result.scalars().all()
    now = datetime.now(timezone.utc)
    for alert in alerts:
        alert.is_read = True
        alert.read_at = now
    await db.flush()
    return APIResponse(success=True, message=f"{len(alerts)} alertes marquées comme lues")


@router.get("/unread-count", response_model=APIResponse[int])
async def get_unread_count(
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get the count of unread alerts."""
    count = (await db.execute(
        select(func.count()).select_from(Alert).where(
            Alert.tenant_id == tenant.id, Alert.user_id == user.id, Alert.is_read == False
        )
    )).scalar() or 0
    return APIResponse(success=True, data=count)


# ─── Alert Configs ────────────────────────────────────────────────────────

@router.get("/configs", response_model=list[AlertConfigResponse])
async def list_alert_configs(
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List alert configurations for the current user."""
    result = await db.execute(
        select(AlertConfig).where(AlertConfig.tenant_id == tenant.id, AlertConfig.user_id == user.id)
    )
    return result.scalars().all()


@router.post("/configs", response_model=AlertConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_alert_config(
    body: AlertConfigCreate,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create an alert configuration."""
    config = AlertConfig(tenant_id=tenant.id, user_id=user.id, **body.model_dump())
    db.add(config)
    await db.flush()
    return config


@router.put("/configs/{config_id}", response_model=AlertConfigResponse)
async def update_alert_config(
    config_id: str,
    is_active: bool | None = None,
    filters: dict | None = None,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Update an alert configuration."""
    result = await db.execute(
        select(AlertConfig).where(AlertConfig.id == config_id, AlertConfig.tenant_id == tenant.id, AlertConfig.user_id == user.id)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration d'alerte introuvable")
    if is_active is not None:
        config.is_active = is_active
    if filters is not None:
        config.filters = filters
    await db.flush()
    return config


@router.delete("/configs/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert_config(
    config_id: str,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Delete an alert configuration."""
    result = await db.execute(
        select(AlertConfig).where(AlertConfig.id == config_id, AlertConfig.tenant_id == tenant.id, AlertConfig.user_id == user.id)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration d'alerte introuvable")
    await db.delete(config)
    await db.flush()
