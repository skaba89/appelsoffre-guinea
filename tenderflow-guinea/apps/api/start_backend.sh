#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
export DATABASE_URL="sqlite+aiosqlite:///./tenderflow_guinea.db"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info
