"""
TenderFlow Guinea — CRM Endpoints
Full CRUD for accounts, contacts, opportunities, interactions, tasks, notes

IMPORTANT: All CRM contacts must contain PROFESSIONAL data only.
No personal emails, no personal phones.
Every contact must have source_url and source_label for traceability.
"""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.deps import get_current_tenant, get_current_membership, pagination_params, require_permission
from app.models.crm import (
    CRMAccount,
    CRMContact,
    CRMOpportunity,
    CRMInteraction,
    CRMTask,
    CRMNote,
)
from app.models.tenant import Tenant
from app.models.user import User
from app.models.membership import Membership
from app.schemas.crm import (
    CRMAccountCreate,
    CRMAccountUpdate,
    CRMAccountResponse,
    CRMContactCreate,
    CRMContactUpdate,
    CRMContactResponse,
    CRMOpportunityCreate,
    CRMOpportunityUpdate,
    CRMOpportunityResponse,
    CRMInteractionCreate,
    CRMInteractionResponse,
    CRMTaskCreate,
    CRMTaskUpdate,
    CRMTaskResponse,
)
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/crm", tags=["CRM"])


# ═══════════════════════════════════════════════════════════════════════
# ACCOUNTS
# ═══════════════════════════════════════════════════════════════════════

@router.get("/accounts", response_model=PaginatedResponse[CRMAccountResponse])
async def list_accounts(
    pagination: dict = Depends(pagination_params),
    account_type: str | None = None,
    is_public_buyer: bool | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.read")),
):
    """List CRM accounts."""
    page = pagination["page"]
    page_size = pagination["page_size"]

    base_q = select(CRMAccount).where(CRMAccount.tenant_id == tenant.id, CRMAccount.is_active.is_(True))
    count_q = select(func.count()).select_from(CRMAccount).where(
        CRMAccount.tenant_id == tenant.id, CRMAccount.is_active.is_(True)
    )

    if account_type:
        base_q = base_q.where(CRMAccount.type == account_type)
        count_q = count_q.where(CRMAccount.type == account_type)
    if is_public_buyer is not None:
        base_q = base_q.where(CRMAccount.is_public_buyer == is_public_buyer)
        count_q = count_q.where(CRMAccount.is_public_buyer == is_public_buyer)
    if search:
        pattern = f"%{search}%"
        base_q = base_q.where(
            CRMAccount.name.ilike(pattern) | CRMAccount.description.ilike(pattern)
        )
        count_q = count_q.where(
            CRMAccount.name.ilike(pattern) | CRMAccount.description.ilike(pattern)
        )

    total = (await db.execute(count_q)).scalar() or 0
    offset = (page - 1) * page_size
    result = await db.execute(base_q.order_by(CRMAccount.created_at.desc()).offset(offset).limit(page_size))
    accounts = result.scalars().all()

    return PaginatedResponse[CRMAccountResponse].create(
        items=[CRMAccountResponse.model_validate(a) for a in accounts],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/accounts", response_model=CRMAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    body: CRMAccountCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Create a CRM account."""
    account = CRMAccount(tenant_id=tenant.id, **body.model_dump())
    db.add(account)
    await db.flush()
    return account


@router.get("/accounts/{account_id}", response_model=CRMAccountResponse)
async def get_account(
    account_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.read")),
):
    """Get a CRM account."""
    result = await db.execute(
        select(CRMAccount).where(CRMAccount.id == account_id, CRMAccount.tenant_id == tenant.id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return account


@router.put("/accounts/{account_id}", response_model=CRMAccountResponse)
async def update_account(
    account_id: UUID,
    body: CRMAccountUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Update a CRM account."""
    result = await db.execute(
        select(CRMAccount).where(CRMAccount.id == account_id, CRMAccount.tenant_id == tenant.id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)

    await db.flush()
    return account


@router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    account_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Soft-delete a CRM account."""
    result = await db.execute(
        select(CRMAccount).where(CRMAccount.id == account_id, CRMAccount.tenant_id == tenant.id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    account.is_active = False
    await db.flush()


# ═══════════════════════════════════════════════════════════════════════
# CONTACTS (PROFESSIONAL ONLY)
# ═══════════════════════════════════════════════════════════════════════

@router.get("/contacts", response_model=PaginatedResponse[CRMContactResponse])
async def list_contacts(
    pagination: dict = Depends(pagination_params),
    account_id: UUID | None = None,
    validation_status: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.read")),
):
    """List CRM contacts (professional only)."""
    page = pagination["page"]
    page_size = pagination["page_size"]

    base_q = select(CRMContact).where(CRMContact.tenant_id == tenant.id, CRMContact.is_active.is_(True))
    count_q = select(func.count()).select_from(CRMContact).where(
        CRMContact.tenant_id == tenant.id, CRMContact.is_active.is_(True)
    )

    if account_id:
        base_q = base_q.where(CRMContact.account_id == account_id)
        count_q = count_q.where(CRMContact.account_id == account_id)
    if validation_status:
        base_q = base_q.where(CRMContact.validation_status == validation_status)
        count_q = count_q.where(CRMContact.validation_status == validation_status)
    if search:
        pattern = f"%{search}%"
        base_q = base_q.where(
            CRMContact.first_name.ilike(pattern)
            | CRMContact.last_name.ilike(pattern)
            | CRMContact.organization_name.ilike(pattern)
            | CRMContact.job_title.ilike(pattern)
        )
        count_q = count_q.where(
            CRMContact.first_name.ilike(pattern)
            | CRMContact.last_name.ilike(pattern)
            | CRMContact.organization_name.ilike(pattern)
            | CRMContact.job_title.ilike(pattern)
        )

    total = (await db.execute(count_q)).scalar() or 0
    offset = (page - 1) * page_size
    result = await db.execute(base_q.order_by(CRMContact.created_at.desc()).offset(offset).limit(page_size))
    contacts = result.scalars().all()

    return PaginatedResponse[CRMContactResponse].create(
        items=[CRMContactResponse.model_validate(c) for c in contacts],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/contacts", response_model=CRMContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    body: CRMContactCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Create a CRM contact (professional only)."""
    contact = CRMContact(
        tenant_id=tenant.id,
        collection_date=datetime.now(timezone.utc),
        **body.model_dump(),
    )
    db.add(contact)
    await db.flush()
    return contact


@router.get("/contacts/{contact_id}", response_model=CRMContactResponse)
async def get_contact(
    contact_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.read")),
):
    """Get a CRM contact."""
    result = await db.execute(
        select(CRMContact).where(CRMContact.id == contact_id, CRMContact.tenant_id == tenant.id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    return contact


@router.put("/contacts/{contact_id}", response_model=CRMContactResponse)
async def update_contact(
    contact_id: UUID,
    body: CRMContactUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Update a CRM contact."""
    result = await db.execute(
        select(CRMContact).where(CRMContact.id == contact_id, CRMContact.tenant_id == tenant.id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)

    await db.flush()
    return contact


@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Soft-delete a CRM contact."""
    result = await db.execute(
        select(CRMContact).where(CRMContact.id == contact_id, CRMContact.tenant_id == tenant.id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    contact.is_active = False
    await db.flush()


# ═══════════════════════════════════════════════════════════════════════
# OPPORTUNITIES
# ═══════════════════════════════════════════════════════════════════════

@router.get("/opportunities", response_model=PaginatedResponse[CRMOpportunityResponse])
async def list_opportunities(
    pagination: dict = Depends(pagination_params),
    stage: str | None = None,
    account_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.read")),
):
    """List CRM opportunities."""
    page = pagination["page"]
    page_size = pagination["page_size"]

    base_q = select(CRMOpportunity).where(
        CRMOpportunity.tenant_id == tenant.id, CRMOpportunity.is_active.is_(True)
    )
    count_q = select(func.count()).select_from(CRMOpportunity).where(
        CRMOpportunity.tenant_id == tenant.id, CRMOpportunity.is_active.is_(True)
    )

    if stage:
        base_q = base_q.where(CRMOpportunity.stage == stage)
        count_q = count_q.where(CRMOpportunity.stage == stage)
    if account_id:
        base_q = base_q.where(CRMOpportunity.account_id == account_id)
        count_q = count_q.where(CRMOpportunity.account_id == account_id)

    total = (await db.execute(count_q)).scalar() or 0
    offset = (page - 1) * page_size
    result = await db.execute(base_q.order_by(CRMOpportunity.created_at.desc()).offset(offset).limit(page_size))
    opportunities = result.scalars().all()

    return PaginatedResponse[CRMOpportunityResponse].create(
        items=[CRMOpportunityResponse.model_validate(o) for o in opportunities],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/opportunities", response_model=CRMOpportunityResponse, status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    body: CRMOpportunityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Create a CRM opportunity."""
    opportunity = CRMOpportunity(tenant_id=tenant.id, **body.model_dump())
    db.add(opportunity)
    await db.flush()
    return opportunity


@router.get("/opportunities/{opportunity_id}", response_model=CRMOpportunityResponse)
async def get_opportunity(
    opportunity_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.read")),
):
    """Get a CRM opportunity."""
    result = await db.execute(
        select(CRMOpportunity).where(
            CRMOpportunity.id == opportunity_id, CRMOpportunity.tenant_id == tenant.id
        )
    )
    opportunity = result.scalar_one_or_none()
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    return opportunity


@router.put("/opportunities/{opportunity_id}", response_model=CRMOpportunityResponse)
async def update_opportunity(
    opportunity_id: UUID,
    body: CRMOpportunityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Update a CRM opportunity."""
    result = await db.execute(
        select(CRMOpportunity).where(
            CRMOpportunity.id == opportunity_id, CRMOpportunity.tenant_id == tenant.id
        )
    )
    opportunity = result.scalar_one_or_none()
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(opportunity, field, value)

    # Auto-complete if status changed to completed
    if body.status == "completed" and not opportunity.completed_at:
        opportunity.completed_at = datetime.now(timezone.utc)

    await db.flush()
    return opportunity


@router.delete("/opportunities/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_opportunity(
    opportunity_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Soft-delete a CRM opportunity."""
    result = await db.execute(
        select(CRMOpportunity).where(
            CRMOpportunity.id == opportunity_id, CRMOpportunity.tenant_id == tenant.id
        )
    )
    opportunity = result.scalar_one_or_none()
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    opportunity.is_active = False
    await db.flush()


# ═══════════════════════════════════════════════════════════════════════
# INTERACTIONS
# ═══════════════════════════════════════════════════════════════════════

@router.post("/interactions", response_model=CRMInteractionResponse, status_code=status.HTTP_201_CREATED)
async def create_interaction(
    body: CRMInteractionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Create a CRM interaction."""
    interaction = CRMInteraction(
        tenant_id=tenant.id,
        created_by=current_user.id,
        date=body.date or datetime.now(timezone.utc),
        **{k: v for k, v in body.model_dump().items() if k != "date"},
    )
    db.add(interaction)
    await db.flush()
    return interaction


@router.get("/interactions", response_model=list[CRMInteractionResponse])
async def list_interactions(
    opportunity_id: UUID | None = None,
    contact_id: UUID | None = None,
    account_id: UUID | None = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.read")),
):
    """List CRM interactions."""
    q = select(CRMInteraction).where(CRMInteraction.tenant_id == tenant.id)
    if opportunity_id:
        q = q.where(CRMInteraction.opportunity_id == opportunity_id)
    if contact_id:
        q = q.where(CRMInteraction.contact_id == contact_id)
    if account_id:
        q = q.where(CRMInteraction.account_id == account_id)
    q = q.order_by(CRMInteraction.date.desc()).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all())


# ═══════════════════════════════════════════════════════════════════════
# TASKS
# ═══════════════════════════════════════════════════════════════════════

@router.get("/tasks", response_model=list[CRMTaskResponse])
async def list_tasks(
    opportunity_id: UUID | None = None,
    status: str | None = None,
    assigned_to: UUID | None = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.read")),
):
    """List CRM tasks."""
    q = select(CRMTask).where(CRMTask.tenant_id == tenant.id)
    if opportunity_id:
        q = q.where(CRMTask.opportunity_id == opportunity_id)
    if status:
        q = q.where(CRMTask.status == status)
    if assigned_to:
        q = q.where(CRMTask.assigned_to == assigned_to)
    q = q.order_by(CRMTask.due_date.asc().nulls_last()).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.post("/tasks", response_model=CRMTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    body: CRMTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Create a CRM task."""
    task = CRMTask(tenant_id=tenant.id, **body.model_dump())
    db.add(task)
    await db.flush()
    return task


@router.put("/tasks/{task_id}", response_model=CRMTaskResponse)
async def update_task(
    task_id: UUID,
    body: CRMTaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Update a CRM task."""
    result = await db.execute(
        select(CRMTask).where(CRMTask.id == task_id, CRMTask.tenant_id == tenant.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    if body.status == "completed" and not task.completed_at:
        task.completed_at = datetime.now(timezone.utc)

    await db.flush()
    return task


# ═══════════════════════════════════════════════════════════════════════
# NOTES
# ═══════════════════════════════════════════════════════════════════════

@router.get("/notes", response_model=list[dict])
async def list_notes(
    account_id: UUID | None = None,
    contact_id: UUID | None = None,
    opportunity_id: UUID | None = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.read")),
):
    """List CRM notes."""
    q = select(CRMNote).where(CRMNote.tenant_id == tenant.id)
    if account_id:
        q = q.where(CRMNote.account_id == account_id)
    if contact_id:
        q = q.where(CRMNote.contact_id == contact_id)
    if opportunity_id:
        q = q.where(CRMNote.opportunity_id == opportunity_id)
    q = q.order_by(CRMNote.is_pinned.desc(), CRMNote.created_at.desc()).limit(limit)
    result = await db.execute(q)
    notes = result.scalars().all()
    return [
        {
            "id": str(n.id),
            "content": n.content,
            "account_id": str(n.account_id) if n.account_id else None,
            "contact_id": str(n.contact_id) if n.contact_id else None,
            "opportunity_id": str(n.opportunity_id) if n.opportunity_id else None,
            "created_by": str(n.created_by),
            "is_pinned": n.is_pinned,
            "created_at": n.created_at.isoformat(),
            "updated_at": n.updated_at.isoformat(),
        }
        for n in notes
    ]


@router.post("/notes", status_code=status.HTTP_201_CREATED)
async def create_note(
    content: str,
    account_id: UUID | None = None,
    contact_id: UUID | None = None,
    opportunity_id: UUID | None = None,
    is_pinned: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("crm.create")),
):
    """Create a CRM note."""
    note = CRMNote(
        tenant_id=tenant.id,
        account_id=account_id,
        contact_id=contact_id,
        opportunity_id=opportunity_id,
        content=content,
        created_by=current_user.id,
        is_pinned=is_pinned,
    )
    db.add(note)
    await db.flush()
    return {"id": str(note.id), "message": "Note created"}
