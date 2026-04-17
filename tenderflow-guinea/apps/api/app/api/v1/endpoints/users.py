"""TenderFlow Guinea — User Endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, hash_password
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.auth import ChangePasswordRequest

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(user: User = Depends(get_current_user)):
    """Get the current user's profile."""
    return user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    body: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile."""
    if body.full_name is not None:
        user.full_name = body.full_name
    if body.avatar_url is not None:
        user.avatar_url = body.avatar_url
    await db.flush()
    return user


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change the current user's password."""
    from app.core.security import verify_password, hash_password
    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    user.hashed_password = hash_password(body.new_password)
    await db.flush()
    return {"message": "Mot de passe modifié avec succès"}


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a user by ID (requires auth)."""
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return target
