"""TenderFlow Guinea — Prompt Endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.deps import get_current_tenant, PaginationParams
from app.models.user import User
from app.models.tenant import Tenant
from app.models.tender import Tender
from app.models.company import CompanyProfile
from app.models.prompt import GeneratedPrompt
from app.schemas.prompt import GeneratedPromptCreate, GeneratedPromptUpdate, GeneratedPromptResponse
from app.schemas.common import PaginatedResponse, APIResponse
from app.services.prompt_generator import generate_all_prompts_for_tender, get_prompt_for_tender, PROMPT_GENERATORS

router = APIRouter(prefix="/prompts", tags=["Prompts"])


@router.get("", response_model=PaginatedResponse[GeneratedPromptResponse])
async def list_prompts(
    pagination: PaginationParams = Depends(),
    tender_id: str | None = Query(None),
    prompt_type: str | None = Query(None),
    is_template: bool | None = Query(None),
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List generated prompts."""
    query = select(GeneratedPrompt).where(GeneratedPrompt.tenant_id == tenant.id)
    count_query = select(func.count()).select_from(GeneratedPrompt).where(GeneratedPrompt.tenant_id == tenant.id)

    if tender_id:
        query = query.where(GeneratedPrompt.tender_id == tender_id)
        count_query = count_query.where(GeneratedPrompt.tender_id == tender_id)
    if prompt_type:
        query = query.where(GeneratedPrompt.prompt_type == prompt_type)
        count_query = count_query.where(GeneratedPrompt.prompt_type == prompt_type)
    if is_template is not None:
        query = query.where(GeneratedPrompt.is_template == is_template)
        count_query = count_query.where(GeneratedPrompt.is_template == is_template)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset(pagination.offset).limit(pagination.limit).order_by(GeneratedPrompt.created_at.desc())
    result = await db.execute(query)

    return PaginatedResponse(
        items=result.scalars().all(), total=total,
        page=pagination.page, page_size=pagination.page_size,
        total_pages=(total + pagination.page_size - 1) // pagination.page_size if total else 0,
    )


@router.post("", response_model=GeneratedPromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    body: GeneratedPromptCreate,
    user: User = Depends(require_role("tenant_admin", "analyst", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Create a custom prompt manually."""
    prompt = GeneratedPrompt(tenant_id=tenant.id, **body.model_dump())
    db.add(prompt)
    await db.flush()
    return prompt


@router.post("/generate/{tender_id}", response_model=APIResponse[dict])
async def generate_prompts_for_tender(
    tender_id: str,
    prompt_type: str | None = Query(None, description="Générer un type spécifique, ou tous si absent"),
    user: User = Depends(require_role("tenant_admin", "analyst", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Auto-generate prompts for a tender based on its data and the company profile."""
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

    if prompt_type:
        # Generate specific prompt type
        prompt_text = get_prompt_for_tender(prompt_type, tender, profile)
        gen_prompt = GeneratedPrompt(
            tenant_id=tenant.id,
            tender_id=tender_id,
            prompt_type=prompt_type,
            title=f"{prompt_type.replace('_', ' ').title()} — {tender.reference}",
            prompt_text=prompt_text,
            sector=tender.sector,
        )
        db.add(gen_prompt)
        await db.flush()
        return APIResponse(success=True, data={"prompt_id": gen_prompt.id, "prompt_type": prompt_type})
    else:
        # Generate all prompt types
        all_prompts = generate_all_prompts_for_tender(tender, profile)
        created = []
        for p_type, p_text in all_prompts.items():
            if p_text:
                gen_prompt = GeneratedPrompt(
                    tenant_id=tenant.id,
                    tender_id=tender_id,
                    prompt_type=p_type,
                    title=f"{p_type.replace('_', ' ').title()} — {tender.reference}",
                    prompt_text=p_text,
                    sector=tender.sector,
                )
                db.add(gen_prompt)
                created.append(p_type)
        await db.flush()
        return APIResponse(success=True, data={"created_types": created, "count": len(created)})


@router.get("/{prompt_id}", response_model=GeneratedPromptResponse)
async def get_prompt(
    prompt_id: str,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get a prompt by ID."""
    result = await db.execute(
        select(GeneratedPrompt).where(GeneratedPrompt.id == prompt_id, GeneratedPrompt.tenant_id == tenant.id)
    )
    prompt = result.scalar_one_or_none()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt introuvable")
    return prompt


@router.put("/{prompt_id}", response_model=GeneratedPromptResponse)
async def update_prompt(
    prompt_id: str,
    body: GeneratedPromptUpdate,
    user: User = Depends(require_role("tenant_admin", "analyst", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Update a prompt (creates a new version)."""
    result = await db.execute(
        select(GeneratedPrompt).where(GeneratedPrompt.id == prompt_id, GeneratedPrompt.tenant_id == tenant.id)
    )
    prompt = result.scalar_one_or_none()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt introuvable")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prompt, key, value)
    prompt.is_edited = True
    prompt.version += 1
    await db.flush()
    return prompt


@router.get("/types/list", response_model=APIResponse[list])
async def list_prompt_types(
    user: User = Depends(get_current_user),
):
    """List all available prompt types."""
    types = [
        {"value": k, "label": k.replace("_", " ").title()}
        for k in PROMPT_GENERATORS.keys()
    ]
    return APIResponse(success=True, data=types)
