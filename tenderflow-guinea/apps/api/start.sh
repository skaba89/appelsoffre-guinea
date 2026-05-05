#!/bin/bash
cd "$(dirname "$0")"

# Create venv if not exists
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt -q
pip install bcrypt -q

# Seed database (uses .env for DATABASE_URL)
export DATABASE_URL="sqlite+aiosqlite:///./tenderflow_guinea.db"
python seed_guinea.py

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
