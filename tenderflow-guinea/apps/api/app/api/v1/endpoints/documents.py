"""TenderFlow Guinea — Document Endpoints."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.deps import get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.models.tender import Tender, TenderDocument
from app.schemas.tender import TenderDocumentResponse
from app.schemas.common import APIResponse
from app.services.document_service import upload_document, extract_text
from app.services.rag import ingest_document

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/tenders/{tender_id}/upload", response_model=TenderDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_tender_document(
    tender_id: str,
    file: UploadFile = File(...),
    user: User = Depends(require_role("tenant_admin", "analyst", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document (DAO, annex, etc.) for a tender."""
    # Verify tender exists and belongs to tenant
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Appel d'offres introuvable")

    content = await file.read()
    doc = await upload_document(db, tender_id, file.filename, content, file.content_type or "application/octet-stream")
    return doc


@router.get("/tenders/{tender_id}", response_model=list[TenderDocumentResponse])
async def list_tender_documents(
    tender_id: str,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List all documents for a tender."""
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Appel d'offres introuvable")

    doc_result = await db.execute(
        select(TenderDocument).where(TenderDocument.tender_id == tender_id)
        .order_by(TenderDocument.created_at.desc())
    )
    return doc_result.scalars().all()


@router.get("/{document_id}", response_model=TenderDocumentResponse)
async def get_document(
    document_id: str,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get a document by ID."""
    result = await db.execute(select(TenderDocument).where(TenderDocument.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document introuvable")
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    user: User = Depends(require_role("tenant_admin", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Delete a document."""
    result = await db.execute(select(TenderDocument).where(TenderDocument.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document introuvable")
    await db.delete(doc)
    await db.flush()


@router.post("/{document_id}/ingest", response_model=APIResponse[dict])
async def ingest_document_endpoint(
    document_id: str,
    user: User = Depends(require_role("tenant_admin", "analyst", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Ingest a document into the RAG pipeline (chunk + embed)."""
    result = await ingest_document(db, document_id)
    return APIResponse(success=True, data=result, message="Document ingéré dans le pipeline RAG")


@router.post("/{document_id}/extract", response_model=APIResponse[str])
async def extract_text_endpoint(
    document_id: str,
    user: User = Depends(require_role("tenant_admin", "analyst", "bid_manager")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Extract text from a document."""
    text = await extract_text(db, document_id)
    if text is None:
        raise HTTPException(status_code=404, detail="Document introuvable")
    return APIResponse(success=True, data=text[:500] + "..." if len(text) > 500 else text)


@router.post("/tenders/{tender_id}/ask", response_model=APIResponse[dict])
async def ask_about_tender(
    tender_id: str,
    question: str,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Ask a question about a tender using RAG over its documents."""
    from app.services.rag import generate_tender_qa
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Appel d'offres introuvable")

    answer = await generate_tender_qa(db, tender_id, question)
    return APIResponse(success=True, data=answer)
