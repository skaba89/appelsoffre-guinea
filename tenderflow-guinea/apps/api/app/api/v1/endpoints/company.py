"""TenderFlow Guinea — Company Profile Endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.deps import get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.models.company import CompanyProfile, Reference
from app.schemas.company import (
    CompanyProfileCreate, CompanyProfileUpdate, CompanyProfileResponse,
    ReferenceCreate, ReferenceResponse,
)
from app.schemas.common import APIResponse

router = APIRouter(prefix="/company", tags=["Company Profile"])


@router.get("/profile", response_model=CompanyProfileResponse)
async def get_company_profile(
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get the company profile for the current tenant."""
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil entreprise non configuré")
    return profile


@router.post("/profile", response_model=CompanyProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_company_profile(
    body: CompanyProfileCreate,
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create the company profile for the current tenant."""
    # Check if profile already exists
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Profil entreprise déjà existant")

    # Convert lists to JSON-compatible format
    data = body.model_dump()
    for key in ("activities", "sectors", "specializations", "past_clients", "references",
                "countries", "regions", "certifications", "technical_capabilities",
                "logistical_capabilities", "partners", "standard_documents",
                "response_templates", "expert_cvs", "reference_library"):
        if key in data and isinstance(data[key], list):
            data[key] = data[key]  # SQLAlchemy handles lists via JSON column

    profile = CompanyProfile(tenant_id=tenant.id, **data)
    db.add(profile)
    await db.flush()
    return profile


@router.put("/profile", response_model=CompanyProfileResponse)
async def update_company_profile(
    body: CompanyProfileUpdate,
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Update the company profile."""
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil entreprise non configuré")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    await db.flush()
    return profile


# ─── References ───────────────────────────────────────────────────────────

@router.get("/references", response_model=list[ReferenceResponse])
async def list_references(
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List all project references."""
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil entreprise non configuré")

    ref_result = await db.execute(
        select(Reference).where(Reference.company_profile_id == profile.id)
        .order_by(Reference.year.desc())
    )
    return ref_result.scalars().all()


@router.post("/references", response_model=ReferenceResponse, status_code=status.HTTP_201_CREATED)
async def create_reference(
    body: ReferenceCreate,
    user: User = Depends(require_role("tenant_admin", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Add a project reference."""
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.tenant_id == tenant.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil entreprise non configuré")

    reference = Reference(company_profile_id=profile.id, **body.model_dump())
    db.add(reference)
    await db.flush()
    return reference


@router.delete("/references/{reference_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reference(
    reference_id: str,
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Delete a project reference."""
    result = await db.execute(select(Reference).where(Reference.id == reference_id))
    reference = result.scalar_one_or_none()
    if not reference:
        raise HTTPException(status_code=404, detail="Référence introuvable")
    await db.delete(reference)
    await db.flush()
