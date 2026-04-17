"""TenderFlow Guinea — API v1 Router."""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth, users, sources, tenders, documents, crm,
    prompts, company, alerts, admin, billing,
)

api_router = APIRouter(prefix="/api/v1")

# Auth
api_router.include_router(auth.router)

# Users
api_router.include_router(users.router)

# Sources & Crawlers
api_router.include_router(sources.router)

# Tenders
api_router.include_router(tenders.router)

# Documents
api_router.include_router(documents.router)

# CRM
api_router.include_router(crm.router)

# Prompts
api_router.include_router(prompts.router)

# Company Profile
api_router.include_router(company.router)

# Alerts
api_router.include_router(alerts.router)

# Admin
api_router.include_router(admin.router)

# Billing
api_router.include_router(billing.router)
