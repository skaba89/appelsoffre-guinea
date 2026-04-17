"""TenderFlow Guinea — Auth Endpoints."""
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    decode_token, get_current_user,
)
from app.core.deps import get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.models.membership import Membership
from app.models.audit import AuditLog
from app.models.billing import Subscription, PLAN_QUOTAS
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, RefreshRequest, InviteUserRequest
from app.schemas.user import UserResponse, UserWithMemberships, MembershipResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user and create their tenant workspace."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Cet email est déjà enregistré")

    # Check if tenant slug is taken
    result = await db.execute(select(Tenant).where(Tenant.slug == body.tenant_slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Cet identifiant de workspace est déjà pris")

    # Create user
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
    )
    db.add(user)
    await db.flush()

    # Create tenant
    tenant = Tenant(
        name=body.tenant_name,
        slug=body.tenant_slug,
        plan="free",
        settings={},
    )
    db.add(tenant)
    await db.flush()

    # Create membership as tenant_admin
    membership = Membership(
        user_id=user.id,
        tenant_id=tenant.id,
        role="tenant_admin",
        accepted_at=datetime.now(timezone.utc),
        is_active=True,
    )
    db.add(membership)
    await db.flush()

    # Create free subscription
    subscription = Subscription(
        tenant_id=tenant.id,
        plan="free",
        status="active",
        quotas=PLAN_QUOTAS["free"],
    )
    db.add(subscription)
    await db.flush()

    # Audit log
    audit = AuditLog(
        tenant_id=tenant.id,
        user_id=user.id,
        action="user.registered",
        resource_type="user",
        resource_id=user.id,
        details={"email": body.email, "tenant_slug": body.tenant_slug},
    )
    db.add(audit)

    # Generate tokens
    access_token = create_access_token(user.id, {"tenant_id": tenant.id, "role": "tenant_admin"})
    refresh_token = create_refresh_token(user.id)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate a user and return JWT tokens."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Compte désactivé")

    # Get active membership for token claims
    result = await db.execute(
        select(Membership).where(Membership.user_id == user.id, Membership.is_active == True)
    )
    membership = result.scalar_one_or_none()
    tenant_id = membership.tenant_id if membership else None
    role = membership.role if membership else "viewer"

    # Audit log
    audit = AuditLog(
        tenant_id=tenant_id,
        user_id=user.id,
        action="user.login",
        resource_type="user",
        resource_id=user.id,
    )
    db.add(audit)

    access_token = create_access_token(user.id, {"tenant_id": tenant_id, "role": role})
    refresh_token = create_refresh_token(user.id)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Refresh an access token using a valid refresh token."""
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token invalide")
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable ou désactivé")

    result = await db.execute(
        select(Membership).where(Membership.user_id == user.id, Membership.is_active == True)
    )
    membership = result.scalar_one_or_none()

    access_token = create_access_token(
        user.id,
        {"tenant_id": membership.tenant_id if membership else None, "role": membership.role if membership else "viewer"},
    )
    refresh_token = create_refresh_token(user.id)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserWithMemberships)
async def get_me(user: User = Depends(get_current_user)):
    """Get the current authenticated user with their memberships."""
    return user


@router.post("/invite", response_model=MembershipResponse, status_code=status.HTTP_201_CREATED)
async def invite_user(
    body: InviteUserRequest,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Invite a new user to the current tenant."""
    # Check if user exists
    result = await db.execute(select(User).where(User.email == body.email))
    invited_user = result.scalar_one_or_none()

    if not invited_user:
        # Create user with a temporary password (they'll set it later)
        invited_user = User(
            email=body.email,
            hashed_password=hash_password(str(uuid4())),  # Temporary password
            full_name=body.full_name,
            is_active=True,
        )
        db.add(invited_user)
        await db.flush()

    # Create membership
    membership = Membership(
        user_id=invited_user.id,
        tenant_id=tenant.id,
        role=body.role,
        invited_by=user.id,
        invited_at=datetime.now(timezone.utc),
        is_active=True,
    )
    db.add(membership)

    # Audit log
    audit = AuditLog(
        tenant_id=tenant.id,
        user_id=user.id,
        action="user.invited",
        resource_type="membership",
        resource_id=membership.id,
        details={"invited_email": body.email, "role": body.role},
    )
    db.add(audit)

    return membership
