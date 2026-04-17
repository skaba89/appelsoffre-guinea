"""
TenderFlow Guinea — API V1 Router
Includes all endpoint routers with prefix /api/v1
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth_router,
    users_router,
    sources_router,
    tenders_router,
    documents_router,
    crm_router,
    prompts_router,
    company_router,
    alerts_router,
    admin_router,
    billing_router,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(sources_router)
api_router.include_router(tenders_router)
api_router.include_router(documents_router)
api_router.include_router(crm_router)
api_router.include_router(prompts_router)
api_router.include_router(company_router)
api_router.include_router(alerts_router)
api_router.include_router(admin_router)
api_router.include_router(billing_router)
