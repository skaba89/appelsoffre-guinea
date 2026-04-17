"""
TenderFlow Guinea — Company Endpoints
GET/PUT /company/profile, CRUD /company/references
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.deps import get_current_tenant, get_current_membership, pagination_params, require_permission
from app.models.company import CompanyProfile, Reference
from app.models.tenant import Tenant
from app.models.user import User
from app.models.membership import Membership
from app.schemas.company import (
    CompanyProfileCreate,
    CompanyProfileUpdate,
    CompanyProfileResponse,
    ReferenceCreate,
    ReferenceResponse,
)
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/company", tags=["Company"])


@router.get("/profile", response_model=CompanyProfileResponse)
async def get_company_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("company.read")),
):
    """Get the company profile for the current tenant."""
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found. Please create one first.",
        )
    return profile


@router.post("/profile", response_model=CompanyProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_company_profile(
    body: CompanyProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("company.create",
),
),
):
    """Create a company profile for the current tenant."""
    # Check if profile already exists (one per tenant)
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Company profile already exists for this tenant. Use PUT to update.",
        )

    profile = CompanyProfile(
        tenant_id=tenant.id,
        **body.model_dump(),
    )
    db.add(profile)
    await db.flush()
    return profile


@router.put("/profile", response_model=CompanyProfileResponse)
async def update_company_profile(
    body: CompanyProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("company.create")),
):
    """Update the company profile."""
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found. Please create one first.",
        )

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.flush()
    return profile


# ── References ──────────────────────────────────────────────────────────

@router.get("/references", response_model=PaginatedResponse[ReferenceResponse])
async def list_references(
    pagination: dict = Depends(pagination_params),
    sector: str | None = None,
    is_public: bool | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("company.read")),
):
    """List company references."""
    page = pagination["page"]
    page_size = pagination["page_size"]

    # Get company profile first
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found",
        )

    base_q = select(Reference).where(Reference.company_profile_id == profile.id)
    count_q = select(func.count()).select_from(Reference).where(
        Reference.company_profile_id == profile.id
    )

    if sector:
        base_q = base_q.where(Reference.sector == sector)
        count_q = count_q.where(Reference.sector == sector)
    if is_public is not None:
        base_q = base_q.where(Reference.is_public == is_public)
        count_q = count_q.where(Reference.is_public == is_public)

    total = (await db.execute(count_q)).scalar() or 0
    offset = (page - 1) * page_size
    result = await db.execute(base_q.order_by(Reference.created_at.desc()).offset(offset).limit(page_size))
    references = result.scalars().all()

    return PaginatedResponse[ReferenceResponse].create(
        items=[ReferenceResponse.model_validate(r) for r in references],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/references", response_model=ReferenceResponse, status_code=status.HTTP_201_CREATED)
async def create_reference(
    body: ReferenceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("company.create")),
):
    """Create a company reference."""
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found",
        )

    reference = Reference(
        company_profile_id=profile.id,
        **body.model_dump(),
    )
    db.add(reference)
    await db.flush()
    return reference


@router.get("/references/{reference_id}", response_model=ReferenceResponse)
async def get_reference(
    reference_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("company.read")),
):
    """Get a specific reference."""
    result = await db.execute(
        select(Reference)
        .join(CompanyProfile, Reference.company_profile_id == CompanyProfile.id)
        .where(Reference.id == reference_id, CompanyProfile.tenant_id == tenant.id)
    )
    reference = result.scalar_one_or_none()
    if not reference:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference not found")
    return reference


@router.put("/references/{reference_id}", response_model=ReferenceResponse)
async def update_reference(
    reference_id: UUID,
    body: ReferenceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("company.create")),
):
    """Update a reference."""
    result = await db.execute(
        select(Reference)
        .join(CompanyProfile, Reference.company_profile_id == CompanyProfile.id)
        .where(Reference.id == reference_id, CompanyProfile.tenant_id == tenant.id)
    )
    reference = result.scalar_one_or_none()
    if not reference:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reference, field, value)

    await db.flush()
    return reference


@router.delete("/references/{reference_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reference(
    reference_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("company.create")),
):
    """Delete a reference."""
    result = await db.execute(
        select(Reference)
        .join(CompanyProfile, Reference.company_profile_id == CompanyProfile.id)
        .where(Reference.id == reference_id, CompanyProfile.tenant_id == tenant.id)
    )
    reference = result.scalar_one_or_none()
    if not reference:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference not found")
    await db.delete(reference)
    await db.flush()
