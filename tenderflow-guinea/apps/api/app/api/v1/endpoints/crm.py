"""TenderFlow Guinea — CRM Endpoints.

COMPLIANCE: All contact data is strictly professional and public.
Every contact must have source traceability (source_url, source_label).
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, optional_current_user, require_role
from app.core.deps import get_current_tenant, optional_get_current_tenant, PaginationParams
from app.models.user import User
from app.models.tenant import Tenant
from app.models.crm import (
    CRMAccount, CRMContact, CRMOpportunity, CRMInteraction, CRMTask, CRMNote,
)
from app.schemas.crm import (
    CRMAccountCreate, CRMAccountUpdate, CRMAccountResponse,
    CRMContactCreate, CRMContactUpdate, CRMContactResponse,
    CRMOpportunityCreate, CRMOpportunityUpdate, CRMOpportunityResponse,
    CRMInteractionCreate, CRMInteractionResponse,
    CRMTaskCreate, CRMTaskUpdate, CRMTaskResponse,
    CRMNoteCreate, CRMNoteResponse,
)
from app.schemas.common import PaginatedResponse, APIResponse

router = APIRouter(prefix="/crm", tags=["CRM"])


# ─── Accounts ─────────────────────────────────────────────────────────────

@router.get("/accounts", response_model=PaginatedResponse[CRMAccountResponse])
async def list_accounts(
    pagination: PaginationParams = Depends(),
    type_filter: str | None = Query(None, alias="type"),
    search: str | None = Query(None),
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List CRM accounts with filtering."""
    query = select(CRMAccount).where(CRMAccount.tenant_id == tenant.id, CRMAccount.is_active == True)
    count_query = select(func.count()).select_from(CRMAccount).where(
        CRMAccount.tenant_id == tenant.id, CRMAccount.is_active == True
    )

    if type_filter:
        query = query.where(CRMAccount.type == type_filter)
        count_query = count_query.where(CRMAccount.type == type_filter)
    if search:
        search_filter = CRMAccount.name.ilike(f"%{search}%")
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset(pagination.offset).limit(pagination.limit).order_by(CRMAccount.created_at.desc())
    result = await db.execute(query)

    return PaginatedResponse(
        items=result.scalars().all(), total=total,
        page=pagination.page, page_size=pagination.page_size,
        total_pages=(total + pagination.page_size - 1) // pagination.page_size if total else 0,
    )


@router.post("/accounts", response_model=CRMAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    body: CRMAccountCreate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create a CRM account."""
    account = CRMAccount(tenant_id=tenant.id, **body.model_dump())
    db.add(account)
    await db.flush()
    return account


@router.get("/accounts/{account_id}", response_model=CRMAccountResponse)
async def get_account(
    account_id: str,
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get a CRM account by ID."""
    result = await db.execute(
        select(CRMAccount).where(CRMAccount.id == account_id, CRMAccount.tenant_id == tenant.id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Compte introuvable")
    return account


@router.put("/accounts/{account_id}", response_model=CRMAccountResponse)
async def update_account(
    account_id: str,
    body: CRMAccountUpdate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Update a CRM account."""
    result = await db.execute(
        select(CRMAccount).where(CRMAccount.id == account_id, CRMAccount.tenant_id == tenant.id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Compte introuvable")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(account, key, value)
    await db.flush()
    return account


@router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    account_id: str,
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a CRM account."""
    result = await db.execute(
        select(CRMAccount).where(CRMAccount.id == account_id, CRMAccount.tenant_id == tenant.id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Compte introuvable")
    account.is_active = False
    await db.flush()


# ─── Companies (alias routes for frontend compatibility) ──────────────────
# The Next.js frontend calls /api/v1/crm/companies but the backend model is
# "accounts".  These alias routes delegate to the same handler logic so the
# frontend works without changes.

@router.get("/companies", response_model=PaginatedResponse[CRMAccountResponse])
async def list_companies(
    pagination: PaginationParams = Depends(),
    type_filter: str | None = Query(None, alias="type"),
    search: str | None = Query(None),
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List CRM companies (alias for /accounts)."""
    return await list_accounts(pagination, type_filter, search, user, tenant, db)


@router.get("/companies/{company_id}", response_model=CRMAccountResponse)
async def get_company(
    company_id: str,
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get a CRM company by ID (alias for /accounts/{id})."""
    return await get_account(company_id, user, tenant, db)


@router.post("/companies", response_model=CRMAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    body: CRMAccountCreate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create a CRM company (alias for POST /accounts)."""
    return await create_account(body, user, tenant, db)


@router.put("/companies/{company_id}", response_model=CRMAccountResponse)
async def update_company(
    company_id: str,
    body: CRMAccountUpdate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Update a CRM company (alias for PUT /accounts/{id})."""
    return await update_account(company_id, body, user, tenant, db)


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: str,
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a CRM company (alias for DELETE /accounts/{id})."""
    return await delete_account(company_id, user, tenant, db)


# ─── Contacts (PROFESSIONAL ONLY) ────────────────────────────────────────

@router.get("/contacts", response_model=PaginatedResponse[CRMContactResponse])
async def list_contacts(
    pagination: PaginationParams = Depends(),
    account_id: str | None = Query(None),
    search: str | None = Query(None),
    validation_status: str | None = Query(None),
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List professional contacts (professional data only)."""
    query = select(CRMContact).where(CRMContact.tenant_id == tenant.id, CRMContact.is_active == True)
    count_query = select(func.count()).select_from(CRMContact).where(
        CRMContact.tenant_id == tenant.id, CRMContact.is_active == True
    )

    if account_id:
        query = query.where(CRMContact.account_id == account_id)
        count_query = count_query.where(CRMContact.account_id == account_id)
    if search:
        search_filter = CRMContact.first_name.ilike(f"%{search}%") | CRMContact.last_name.ilike(f"%{search}%") | CRMContact.organization_name.ilike(f"%{search}%")
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)
    if validation_status:
        query = query.where(CRMContact.validation_status == validation_status)
        count_query = count_query.where(CRMContact.validation_status == validation_status)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset(pagination.offset).limit(pagination.limit).order_by(CRMContact.created_at.desc())
    result = await db.execute(query)

    return PaginatedResponse(
        items=result.scalars().all(), total=total,
        page=pagination.page, page_size=pagination.page_size,
        total_pages=(total + pagination.page_size - 1) // pagination.page_size if total else 0,
    )


@router.post("/contacts", response_model=CRMContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    body: CRMContactCreate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create a professional contact (professional data only, with source traceability)."""
    contact = CRMContact(
        tenant_id=tenant.id,
        collection_date=datetime.now(timezone.utc),
        validation_status="pending",
        **body.model_dump(),
    )
    db.add(contact)
    await db.flush()
    return contact


@router.get("/contacts/{contact_id}", response_model=CRMContactResponse)
async def get_contact(
    contact_id: str,
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get a professional contact by ID."""
    result = await db.execute(
        select(CRMContact).where(CRMContact.id == contact_id, CRMContact.tenant_id == tenant.id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact introuvable")
    return contact


@router.put("/contacts/{contact_id}", response_model=CRMContactResponse)
async def update_contact(
    contact_id: str,
    body: CRMContactUpdate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Update a professional contact."""
    result = await db.execute(
        select(CRMContact).where(CRMContact.id == contact_id, CRMContact.tenant_id == tenant.id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact introuvable")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(contact, key, value)
    await db.flush()
    return contact


@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: str,
    user: User = Depends(require_role("tenant_admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a professional contact."""
    result = await db.execute(
        select(CRMContact).where(CRMContact.id == contact_id, CRMContact.tenant_id == tenant.id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact introuvable")
    contact.is_active = False
    await db.flush()


@router.post("/contacts/{contact_id}/validate", response_model=CRMContactResponse)
async def validate_contact(
    contact_id: str,
    validation_status: str = Query(..., pattern=r"^(verified|rejected)$"),
    user: User = Depends(require_role("tenant_admin", "sales")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Validate or reject a professional contact's data."""
    result = await db.execute(
        select(CRMContact).where(CRMContact.id == contact_id, CRMContact.tenant_id == tenant.id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact introuvable")
    contact.validation_status = validation_status
    await db.flush()
    return contact


# ─── Opportunities ────────────────────────────────────────────────────────

@router.get("/opportunities", response_model=PaginatedResponse[CRMOpportunityResponse])
async def list_opportunities(
    pagination: PaginationParams = Depends(),
    stage: str | None = Query(None),
    account_id: str | None = Query(None),
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List CRM opportunities."""
    query = select(CRMOpportunity).where(CRMOpportunity.tenant_id == tenant.id, CRMOpportunity.is_active == True)
    count_query = select(func.count()).select_from(CRMOpportunity).where(
        CRMOpportunity.tenant_id == tenant.id, CRMOpportunity.is_active == True
    )

    if stage:
        query = query.where(CRMOpportunity.stage == stage)
        count_query = count_query.where(CRMOpportunity.stage == stage)
    if account_id:
        query = query.where(CRMOpportunity.account_id == account_id)
        count_query = count_query.where(CRMOpportunity.account_id == account_id)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset(pagination.offset).limit(pagination.limit).order_by(CRMOpportunity.created_at.desc())
    result = await db.execute(query)

    return PaginatedResponse(
        items=result.scalars().all(), total=total,
        page=pagination.page, page_size=pagination.page_size,
        total_pages=(total + pagination.page_size - 1) // pagination.page_size if total else 0,
    )


@router.post("/opportunities", response_model=CRMOpportunityResponse, status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    body: CRMOpportunityCreate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create a CRM opportunity."""
    opportunity = CRMOpportunity(tenant_id=tenant.id, **body.model_dump())
    db.add(opportunity)
    await db.flush()
    return opportunity


@router.get("/opportunities/{opportunity_id}", response_model=CRMOpportunityResponse)
async def get_opportunity(
    opportunity_id: str,
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get a CRM opportunity by ID."""
    result = await db.execute(
        select(CRMOpportunity).where(CRMOpportunity.id == opportunity_id, CRMOpportunity.tenant_id == tenant.id)
    )
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunité introuvable")
    return opp


@router.put("/opportunities/{opportunity_id}", response_model=CRMOpportunityResponse)
async def update_opportunity(
    opportunity_id: str,
    body: CRMOpportunityUpdate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Update a CRM opportunity."""
    result = await db.execute(
        select(CRMOpportunity).where(CRMOpportunity.id == opportunity_id, CRMOpportunity.tenant_id == tenant.id)
    )
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunité introuvable")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(opp, key, value)
    await db.flush()
    return opp


@router.put("/opportunities/{opportunity_id}/stage", response_model=CRMOpportunityResponse)
async def update_opportunity_stage(
    opportunity_id: str,
    stage: str = Query(..., pattern=r"^(prospecting|qualification|proposal|negotiation|won|lost)$"),
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Move an opportunity to a different pipeline stage."""
    result = await db.execute(
        select(CRMOpportunity).where(CRMOpportunity.id == opportunity_id, CRMOpportunity.tenant_id == tenant.id)
    )
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunité introuvable")
    opp.stage = stage
    await db.flush()
    return opp


# ─── Interactions ─────────────────────────────────────────────────────────

@router.post("/interactions", response_model=CRMInteractionResponse, status_code=status.HTTP_201_CREATED)
async def create_interaction(
    body: CRMInteractionCreate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Log an interaction with a contact/account."""
    interaction = CRMInteraction(
        tenant_id=tenant.id,
        created_by=user.id,
        date=body.date or datetime.now(timezone.utc),
        **body.model_dump(exclude={"date"}),
    )
    db.add(interaction)
    await db.flush()
    return interaction


@router.get("/interactions", response_model=list[CRMInteractionResponse])
async def list_interactions(
    opportunity_id: str | None = Query(None),
    contact_id: str | None = Query(None),
    account_id: str | None = Query(None),
    limit: int = Query(50, le=200),
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List interactions, optionally filtered."""
    query = select(CRMInteraction).where(CRMInteraction.tenant_id == tenant.id)
    if opportunity_id:
        query = query.where(CRMInteraction.opportunity_id == opportunity_id)
    if contact_id:
        query = query.where(CRMInteraction.contact_id == contact_id)
    if account_id:
        query = query.where(CRMInteraction.account_id == account_id)
    query = query.order_by(CRMInteraction.date.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


# ─── Tasks ────────────────────────────────────────────────────────────────

@router.post("/tasks", response_model=CRMTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    body: CRMTaskCreate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create a CRM task."""
    task = CRMTask(tenant_id=tenant.id, **body.model_dump())
    db.add(task)
    await db.flush()
    return task


@router.get("/tasks", response_model=list[CRMTaskResponse])
async def list_tasks(
    opportunity_id: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    limit: int = Query(50, le=200),
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List CRM tasks."""
    query = select(CRMTask).where(CRMTask.tenant_id == tenant.id)
    if opportunity_id:
        query = query.where(CRMTask.opportunity_id == opportunity_id)
    if status_filter:
        query = query.where(CRMTask.status == status_filter)
    query = query.order_by(CRMTask.due_date.asc().nulls_last()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/tasks/{task_id}", response_model=CRMTaskResponse)
async def update_task(
    task_id: str,
    body: CRMTaskUpdate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Update a CRM task."""
    result = await db.execute(select(CRMTask).where(CRMTask.id == task_id, CRMTask.tenant_id == tenant.id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    if body.status == "completed":
        task.completed_at = datetime.now(timezone.utc)
    await db.flush()
    return task


# ─── Notes ────────────────────────────────────────────────────────────────

@router.post("/notes", response_model=CRMNoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    body: CRMNoteCreate,
    user: User = Depends(require_role("tenant_admin", "sales", "bid_manager", "analyst")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create a CRM note."""
    note = CRMNote(tenant_id=tenant.id, created_by=user.id, **body.model_dump())
    db.add(note)
    await db.flush()
    return note


@router.get("/notes", response_model=list[CRMNoteResponse])
async def list_notes(
    account_id: str | None = Query(None),
    contact_id: str | None = Query(None),
    opportunity_id: str | None = Query(None),
    limit: int = Query(50, le=200),
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List CRM notes."""
    query = select(CRMNote).where(CRMNote.tenant_id == tenant.id)
    if account_id:
        query = query.where(CRMNote.account_id == account_id)
    if contact_id:
        query = query.where(CRMNote.contact_id == contact_id)
    if opportunity_id:
        query = query.where(CRMNote.opportunity_id == opportunity_id)
    query = query.order_by(CRMNote.is_pinned.desc(), CRMNote.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


# ─── Pipeline Stats ───────────────────────────────────────────────────────

@router.get("/pipeline/stats", response_model=APIResponse[dict])
async def get_pipeline_stats(
    user: Optional[User] = Depends(optional_current_user),
    tenant: Tenant = Depends(optional_get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get CRM pipeline statistics."""
    by_stage = await db.execute(
        select(CRMOpportunity.stage, func.count(), func.sum(CRMOpportunity.amount))
        .where(CRMOpportunity.tenant_id == tenant.id, CRMOpportunity.is_active == True)
        .group_by(CRMOpportunity.stage)
    )
    stage_data = {}
    for stage, count, total_amount in by_stage.all():
        stage_data[stage] = {"count": count, "total_amount": float(total_amount) if total_amount else 0}

    total_contacts = (await db.execute(
        select(func.count()).select_from(CRMContact).where(
            CRMContact.tenant_id == tenant.id, CRMContact.is_active == True
        )
    )).scalar() or 0

    total_accounts = (await db.execute(
        select(func.count()).select_from(CRMAccount).where(
            CRMAccount.tenant_id == tenant.id, CRMAccount.is_active == True
        )
    )).scalar() or 0

    return APIResponse(success=True, data={
        "pipeline": stage_data,
        "total_contacts": total_contacts,
        "total_accounts": total_accounts,
    })
