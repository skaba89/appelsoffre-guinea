"""TenderFlow Guinea — User Pydantic Schemas."""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)


class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: str | None
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MembershipResponse(BaseModel):
    id: str
    tenant_id: str
    role: str
    is_active: bool
    accepted_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class UserWithMemberships(UserResponse):
    memberships: list[MembershipResponse] = []
