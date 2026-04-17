"""TenderFlow Guinea — Common Pydantic Schemas."""
from typing import Any, Generic, TypeVar, Optional
from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Pagination parameters."""
    page: int = Field(1, ge=1, description="Numéro de page")
    page_size: int = Field(20, ge=1, le=100, description="Taille de page")


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True


class SortParams(BaseModel):
    """Sorting parameters."""
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"


class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper."""
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response."""
    success: bool = False
    detail: str
    error_code: Optional[str] = None
