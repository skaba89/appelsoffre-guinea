"""TenderFlow Guinea — Security utilities for JWT auth and password hashing."""
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def hash_password(password: str) -> str:
    """Hash a plaintext password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str | UUID, extra_claims: Optional[dict] = None) -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    claims = {
        "sub": str(subject),
        "exp": expire,
        "type": "access",
    }
    if extra_claims:
        claims.update(extra_claims)
    return jwt.encode(claims, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str | UUID) -> str:
    """Create a JWT refresh token."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    claims = {
        "sub": str(subject),
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(claims, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token. Raises JWTError on failure."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """FastAPI dependency: extract and validate the current user from the JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id: Optional[str] = payload.get("sub")
        token_type: Optional[str] = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from app.models.user import User
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_role(*allowed_roles: str):
    """Factory dependency that checks the current user has one of the allowed roles in their active membership."""
    async def _check_role(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
        from app.models.membership import Membership
        result = await db.execute(
            select(Membership).where(
                Membership.user_id == user.id,
                Membership.is_active == True,
            )
        )
        memberships = result.scalars().all()
        user_roles = [m.role for m in memberships]
        if not any(role in allowed_roles for role in user_roles) and not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Rôle requis : {', '.join(allowed_roles)}",
            )
        return user
    return _check_role
