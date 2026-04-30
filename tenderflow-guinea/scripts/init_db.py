"""TenderFlow Guinea — Database Initialization Script.

Creates all tables, extensions (pgvector), and initial data.
Run this script once to set up a fresh database.
"""
import asyncio
import sys
import os

# Add the api app to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

from app.core.database import engine, Base
from app.models import *  # noqa: F401, F403 - Import all models to register them


async def init_database():
    """Create all database tables and extensions."""
    from sqlalchemy import text

    print("🔧 Initializing TenderFlow Guinea database...")

    async with engine.begin() as conn:
        # Enable pgvector extension
        print("  → Enabling pgvector extension...")
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

        # Enable uuid extension
        print("  → Enabling uuid-ossp extension...")
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))

        # Create all tables
        print("  → Creating tables...")
        await conn.run_sync(Base.metadata.create_all)

    print("✅ Database initialized successfully!")
    print()
    print("Next steps:")
    print("  1. Run: alembic stamp head  (if using Alembic)")
    print("  2. Run: python scripts/seed_data.py  (to load test data)")


if __name__ == "__main__":
    asyncio.run(init_database())
