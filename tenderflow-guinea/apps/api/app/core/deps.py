"""TenderFlow Guinea — Common FastAPI dependencies."""
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, Query, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.membership import Membership
from app.models.tenant import Tenant


async def get_current_tenant(
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Tenant:
    """Resolve the active tenant for the current user.
    First tries X-Tenant-ID header, then falls back to user's active membership."""
    # Try header-based tenant resolution first
    header_tenant_id = request.headers.get("X-Tenant-ID")
    if header_tenant_id:
        result = await db.execute(select(Tenant).where(Tenant.id == header_tenant_id))
        tenant = result.scalar_one_or_none()
        if tenant and tenant.is_active:
            # Verify user has membership in this tenant
            membership_result = await db.execute(
                select(Membership).where(
                    Membership.user_id == user.id,
                    Membership.tenant_id == tenant.id,
                    Membership.is_active == True,
                )
            )
            if membership_result.scalar_one_or_none():
                return tenant

    # Fallback: use the first active membership
    result = await db.execute(
        select(Membership)
        .where(Membership.user_id == user.id, Membership.is_active == True)
        .limit(1)
    )
    membership = result.scalar_one_or_none()
    if membership is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Aucun workspace actif")
    result = await db.execute(select(Tenant).where(Tenant.id == membership.tenant_id))
    tenant = result.scalar_one_or_none()
    if tenant is None or not tenant.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Workspace introuvable")
    return tenant


class PaginationParams:
    """Pagination query parameters."""

    def __init__(
        self,
        page: int = Query(1, ge=1, description="Numéro de page"),
        page_size: int = Query(20, ge=1, le=100, description="Taille de page"),
    ):
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size

    @property
    def limit(self) -> int:
        return self.page_size


class SortParams:
    """Sorting query parameters."""

    def __init__(
        self,
        sort_by: Optional[str] = Query(None, description="Champ de tri"),
        sort_order: Optional[str] = Query("desc", description="Ordre de tri (asc/desc)"),
    ):
        self.sort_by = sort_by
        self.sort_order = sort_order or "desc"
