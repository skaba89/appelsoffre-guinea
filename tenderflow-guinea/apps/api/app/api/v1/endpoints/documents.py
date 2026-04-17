"""
TenderFlow Guinea — Document Endpoints
POST /tenders/{id}/documents (upload), GET /tenders/{id}/documents,
GET /documents/{id}, DELETE /documents/{id}
"""

import os
import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.deps import get_current_tenant, require_permission, get_current_membership
from app.models.tender import Tender, TenderDocument
from app.models.tenant import Tenant
from app.models.user import User
from app.models.membership import Membership
from app.schemas.tender import TenderDocumentResponse

router = APIRouter(prefix="/documents", tags=["Documents"])

# Allowed file types
ALLOWED_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
    "application/zip",
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


def _get_storage_root() -> str:
    """Return the root directory for file storage."""
    storage_root = os.path.join(os.getcwd(), "storage", "documents")
    os.makedirs(storage_root, exist_ok=True)
    return storage_root


@router.post(
    "/tenders/{tender_id}/documents",
    response_model=TenderDocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    tender_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("documents.create")),
):
    """Upload a document to a tender."""
    # Verify tender exists and belongs to tenant
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tender not found")

    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{file.content_type}' is not allowed. "
                   f"Allowed types: {', '.join(sorted(ALLOWED_TYPES))}",
        )

    # Read file content
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )

    # Generate unique filename and storage path
    original_filename = file.filename or "untitled"
    ext = os.path.splitext(original_filename)[1]
    stored_filename = f"{uuid.uuid4().hex}{ext}"

    tenant_dir = os.path.join(_get_storage_root(), str(tenant.id), str(tender_id))
    os.makedirs(tenant_dir, exist_ok=True)
    storage_path = os.path.join(tenant_dir, stored_filename)

    # Write file to disk
    with open(storage_path, "wb") as f:
        f.write(content)

    # Create database record
    doc = TenderDocument(
        tender_id=tender_id,
        filename=stored_filename,
        original_filename=original_filename,
        file_type=file.content_type,
        file_size=len(content),
        storage_path=storage_path,
        is_parsed=False,
    )
    db.add(doc)
    await db.flush()

    return doc


@router.get("/tenders/{tender_id}/documents", response_model=list[TenderDocumentResponse])
async def list_tender_documents(
    tender_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("documents.read")),
):
    """List all documents for a tender."""
    # Verify tender belongs to tenant
    result = await db.execute(
        select(Tender).where(Tender.id == tender_id, Tender.tenant_id == tenant.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tender not found")

    result = await db.execute(
        select(TenderDocument).where(TenderDocument.tender_id == tender_id)
    )
    return list(result.scalars().all())


@router.get("/{document_id}", response_model=TenderDocumentResponse)
async def get_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("documents.read")),
):
    """Get a specific document's metadata."""
    result = await db.execute(
        select(TenderDocument)
        .join(Tender, TenderDocument.tender_id == Tender.id)
        .where(TenderDocument.id == document_id, Tender.tenant_id == tenant.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    _membership: Membership = Depends(require_permission("documents.delete")),
):
    """Delete a document."""
    result = await db.execute(
        select(TenderDocument)
        .join(Tender, TenderDocument.tender_id == Tender.id)
        .where(TenderDocument.id == document_id, Tender.tenant_id == tenant.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    # Remove file from disk
    if os.path.exists(doc.storage_path):
        os.remove(doc.storage_path)

    await db.delete(doc)
    await db.flush()
