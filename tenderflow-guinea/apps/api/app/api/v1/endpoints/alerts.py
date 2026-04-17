"""
TenderFlow Guinea — Alert Endpoints
GET /alerts, PUT /alerts/{id}/read, CRUD /alert-configs
"""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.deps import get_current_tenant, get_current_membership, pagination_params, require_permission
from app.models.alert import Alert, AlertConfig
from app.models.tenant import Tenant
from app.models.user import User
from app.models.membership import Membership
from app.schemas.alert import AlertCreate, AlertResponse, AlertConfigCreate, AlertConfigResponse
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])


# ── Alerts ─────────────────────────────────────────────────────────────

@router.get("/", response_model=PaginatedResponse[AlertResponse])
async def list_alerts(
    pagination: dict = Depends(pagination_params),
    is_read: bool | None = None,
    priority: str | None = None,
    alert_type: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("alerts.read")),
):
    """List alerts for the current user."""
    page = pagination["page"]
    page_size = pagination["page_size"]

    base_q = select(Alert).where(
        Alert.tenant_id == tenant.id,
        Alert.user_id == current_user.id,
    )
    count_q = select(func.count()).select_from(Alert).where(
        Alert.tenant_id == tenant.id,
        Alert.user_id == current_user.id,
    )

    if is_read is not None:
        base_q = base_q.where(Alert.is_read == is_read)
        count_q = count_q.where(Alert.is_read == is_read)
    if priority:
        base_q = base_q.where(Alert.priority == priority)
        count_q = count_q.where(Alert.priority == priority)
    if alert_type:
        base_q = base_q.where(Alert.alert_type == alert_type)
        count_q = count_q.where(Alert.alert_type == alert_type)

    total = (await db.execute(count_q)).scalar() or 0
    offset = (page - 1) * page_size
    result = await db.execute(base_q.order_by(Alert.created_at.desc()).offset(offset).limit(page_size))
    alerts = result.scalars().all()

    return PaginatedResponse[AlertResponse].create(
        items=[AlertResponse.model_validate(a) for a in alerts],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.put("/{alert_id}/read", response_model=AlertResponse)
async def mark_alert_read(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
):
    """Mark an alert as read."""
    result = await db.execute(
        select(Alert).where(
            Alert.id == alert_id,
            Alert.tenant_id == tenant.id,
            Alert.user_id == current_user.id,
        )
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    alert.is_read = True
    alert.read_at = datetime.now(timezone.utc)
    await db.flush()
    return alert


@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    body: AlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
):
    """Create a custom alert."""
    alert = Alert(
        tenant_id=tenant.id,
        user_id=current_user.id,
        **body.model_dump(),
    )
    db.add(alert)
    await db.flush()
    return alert


# ── Alert Configs ──────────────────────────────────────────────────────

@router.get("/configs", response_model=list[AlertConfigResponse])
async def list_alert_configs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("alerts.read")),
):
    """List alert configurations for the current user."""
    result = await db.execute(
        select(AlertConfig).where(
            AlertConfig.tenant_id == tenant.id,
            AlertConfig.user_id == current_user.id,
        ).order_by(AlertConfig.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("/configs", response_model=AlertConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_alert_config(
    body: AlertConfigCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
):
    """Create an alert configuration."""
    config = AlertConfig(
        tenant_id=tenant.id,
        user_id=current_user.id,
        **body.model_dump(),
    )
    db.add(config)
    await db.flush()
    return config


@router.put("/configs/{config_id}", response_model=AlertConfigResponse)
async def update_alert_config(
    config_id: UUID,
    body: AlertConfigCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
):
    """Update an alert configuration."""
    result = await db.execute(
        select(AlertConfig).where(
            AlertConfig.id == config_id,
            AlertConfig.tenant_id == tenant.id,
            AlertConfig.user_id == current_user.id,
        )
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert config not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)

    await db.flush()
    return config


@router.delete("/configs/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert_config(
    config_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
):
    """Delete an alert configuration."""
    result = await db.execute(
        select(AlertConfig).where(
            AlertConfig.id == config_id,
            AlertConfig.tenant_id == tenant.id,
            AlertConfig.user_id == current_user.id,
        )
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert config not found")
    await db.delete(config)
    await db.flush()
