"""TenderFlow Guinea — Membership Model (User-Tenant link with roles)."""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, Boolean, DateTime, ForeignKey

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Membership(Base):
    """Links a user to a tenant with a specific role."""
    __tablename__ = "memberships"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="viewer")
    # Roles: super_admin, tenant_admin, analyst, sales, bid_manager, viewer

    invited_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    invited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="memberships", foreign_keys=[user_id])
    tenant = relationship("Tenant", back_populates="memberships")
    inviter = relationship("User", foreign_keys=[invited_by])

    def __repr__(self) -> str:
        return f"<Membership user={self.user_id} tenant={self.tenant_id} role={self.role}>"
