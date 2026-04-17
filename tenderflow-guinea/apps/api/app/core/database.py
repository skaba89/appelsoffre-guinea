"""TenderFlow Guinea — Async SQLAlchemy Database Setup."""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass
from typing import AsyncGenerator

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Declarative base for all models."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize the database — create tables if they don't exist."""
    async with engine.begin() as conn:
        from app.models import *  # noqa: F401, F403 — ensure all models are registered
        await conn.run_sync(Base.metadata.create_all)
