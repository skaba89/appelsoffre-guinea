"""
TenderFlow Guinea — Prompt Endpoints
CRUD /prompts, POST /prompts/generate/{tender_id}, POST /prompts/{id}/version
"""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.deps import get_current_tenant, get_current_membership, pagination_params, require_permission
from app.models.prompt import GeneratedPrompt
from app.models.tender import Tender
from app.models.company import CompanyProfile
from app.models.tenant import Tenant
from app.models.user import User
from app.models.membership import Membership
from app.schemas.prompt import GeneratedPromptCreate, GeneratedPromptUpdate, GeneratedPromptResponse
from app.schemas.common import PaginatedResponse, APIResponse

router = APIRouter(prefix="/prompts", tags=["Prompts"])


@router.get("/", response_model=PaginatedResponse[GeneratedPromptResponse])
async def list_prompts(
    pagination: dict = Depends(pagination_params),
    prompt_type: str | None = None,
    tender_id: UUID | None = None,
    is_template: bool | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("prompts.read")),
):
    """List generated prompts."""
    page = pagination["page"]
    page_size = pagination["page_size"]

    base_q = select(GeneratedPrompt).where(GeneratedPrompt.tenant_id == tenant.id)
    count_q = select(func.count()).select_from(GeneratedPrompt).where(
        GeneratedPrompt.tenant_id == tenant.id
    )

    if prompt_type:
        base_q = base_q.where(GeneratedPrompt.prompt_type == prompt_type)
        count_q = count_q.where(GeneratedPrompt.prompt_type == prompt_type)
    if tender_id:
        base_q = base_q.where(GeneratedPrompt.tender_id == tender_id)
        count_q = count_q.where(GeneratedPrompt.tender_id == tender_id)
    if is_template is not None:
        base_q = base_q.where(GeneratedPrompt.is_template == is_template)
        count_q = count_q.where(GeneratedPrompt.is_template == is_template)

    total = (await db.execute(count_q)).scalar() or 0
    offset = (page - 1) * page_size
    result = await db.execute(base_q.order_by(GeneratedPrompt.created_at.desc()).offset(offset).limit(page_size))
    prompts = result.scalars().all()

    return PaginatedResponse[GeneratedPromptResponse].create(
        items=[GeneratedPromptResponse.model_validate(p) for p in prompts],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/", response_model=GeneratedPromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    body: GeneratedPromptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("prompts.create"),
),
):
    """Create a generated prompt."""
    prompt = GeneratedPrompt(
        tenant_id=tenant.id,
        **body.model_dump(),
    )
    db.add(prompt)
    await db.flush()
    return prompt


@router.get("/{prompt_id}", response_model=GeneratedPromptResponse)
async def get_prompt(
    prompt_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("prompts.read")),
):
    """Get a specific prompt."""
    result = await db.execute(
        select(GeneratedPrompt).where(
            GeneratedPrompt.id == prompt_id, GeneratedPrompt.tenant_id == tenant.id
        )
    )
    prompt = result.scalar_one_or_none()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return prompt


@router.put("/{prompt_id}", response_model=GeneratedPromptResponse)
async def update_prompt(
    prompt_id: UUID,
    body: GeneratedPromptUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("prompts.create")),
):
    """Update a prompt."""
    result = await db.execute(
        select(GeneratedPrompt).where(
            GeneratedPrompt.id == prompt_id, GeneratedPrompt.tenant_id == tenant.id
        )
    )
    prompt = result.scalar_one_or_none()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prompt, field, value)

    # Mark as edited if prompt_text is changed
    if "prompt_text" in update_data and update_data["prompt_text"] != prompt.prompt_text:
        prompt.is_edited = True

    await db.flush()
    return prompt


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prompt(
    prompt_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("prompts.create")),
):
    """Delete a prompt."""
    result = await db.execute(
        select(GeneratedPrompt).where(
            GeneratedPrompt.id == prompt_id, GeneratedPrompt.tenant_id == tenant.id
        )
    )
    prompt = result.scalar_one_or_none()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    await db.delete(prompt)
    await db.flush()


@router.post("/generate/{tender_id}", response_model=APIResponse[dict])
async def generate_prompts_for_tender(
    tender_id: UUID,
    prompt_types: list[str] | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("prompts.create")),
):
    """Generate prompts for a tender based on its type and context."""
    from app.services.prompt_generator import (
        generate_dao_analysis_prompt,
        generate_technical_memo_prompt,
        generate_financial_offer_prompt,
        generate_company_presentation_prompt,
        generate_project_planning_prompt,
        generate_document_list_prompt,
        generate_oral_defense_prompt,
        generate_partner_search_prompt,
        generate_competition_benchmark_prompt,
    )

    # Get tender
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

    # All available generators
    all_generators = {
        "dao_analysis": lambda: generate_dao_analysis_prompt(tender),
        "technical_memo": lambda: generate_technical_memo_prompt(tender, company),
        "financial_offer": lambda: generate_financial_offer_prompt(tender),
        "company_presentation": lambda: generate_company_presentation_prompt(company) if company else "",
        "project_planning": lambda: generate_project_planning_prompt(tender),
        "document_list": lambda: generate_document_list_prompt(tender),
        "oral_defense": lambda: generate_oral_defense_prompt(tender),
        "partner_search": lambda: generate_partner_search_prompt(tender, company),
        "competition_benchmark": lambda: generate_competition_benchmark_prompt(tender),
    }

    # Filter to requested types
    types_to_generate = prompt_types or list(all_generators.keys())
    created_prompts = []

    for ptype in types_to_generate:
        if ptype not in all_generators:
            continue

        prompt_text = all_generators[ptype]()
        if not prompt_text:
            continue

        prompt = GeneratedPrompt(
            tenant_id=tenant.id,
            tender_id=tender_id,
            prompt_type=ptype,
            title=f"{ptype.replace('_', ' ').title()} — {tender.title}",
            prompt_text=prompt_text,
            sector=tender.sector,
            version=1,
        )
        db.add(prompt)
        created_prompts.append(ptype)

    await db.flush()

    return APIResponse(
        success=True,
        message=f"Generated {len(created_prompts)} prompts",
        data={"generated_types": created_prompts},
    )


@router.post("/{prompt_id}/version", response_model=GeneratedPromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt_version(
    prompt_id: UUID,
    new_text: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("prompts.create")),
):
    """Create a new version of an existing prompt."""
    result = await db.execute(
        select(GeneratedPrompt).where(
            GeneratedPrompt.id == prompt_id, GeneratedPrompt.tenant_id == tenant.id
        )
    )
    original = result.scalar_one_or_none()
    if not original:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")

    new_prompt = GeneratedPrompt(
        tenant_id=tenant.id,
        tender_id=original.tender_id,
        prompt_type=original.prompt_type,
        title=original.title,
        prompt_text=new_text or original.prompt_text,
        variables=original.variables,
        sector=original.sector,
        is_edited=new_text is not None,
        version=original.version + 1,
        is_template=original.is_template,
    )
    db.add(new_prompt)
    await db.flush()
    return new_prompt
