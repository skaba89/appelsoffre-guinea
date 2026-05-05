"""TenderFlow Guinea — Category, Tag, and TenderTagLink Models."""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Category(Base):
    """Hierarchical category for tenders (taxonomy)."""
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    sector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    parent_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    children = relationship("Category", backref="parent", remote_side="Category.id", lazy="selectin")
    tenders = relationship("Tender", back_populates="category", lazy="noload")

    def __repr__(self) -> str:
        return f"<Category {self.slug}>"


class Tag(Base):
    """Tag for flexible tender classification."""
    __tablename__ = "tags"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Tag {self.slug}>"


class TenderTagLink(Base):
    """Many-to-many link between tenders and tags."""
    __tablename__ = "tender_tag_links"

    tender_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenders.id", ondelete="CASCADE"), primary_key=True)
    tag_id: Mapped[str] = mapped_column(String(36), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

    # Relationships
    tender = relationship("Tender", back_populates="tag_links")
    tag = relationship("Tag", lazy="selectin")

    def __repr__(self) -> str:
        return f"<TenderTagLink tender={self.tender_id} tag={self.tag_id}>"
