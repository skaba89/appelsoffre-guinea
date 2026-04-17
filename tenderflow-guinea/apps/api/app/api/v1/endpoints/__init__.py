"""
TenderFlow Guinea — API V1 Endpoints Package
"""

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.sources import router as sources_router
from app.api.v1.endpoints.tenders import router as tenders_router
from app.api.v1.endpoints.documents import router as documents_router
from app.api.v1.endpoints.crm import router as crm_router
from app.api.v1.endpoints.prompts import router as prompts_router
from app.api.v1.endpoints.company import router as company_router
from app.api.v1.endpoints.alerts import router as alerts_router
from app.api.v1.endpoints.admin import router as admin_router
from app.api.v1.endpoints.billing import router as billing_router

__all__ = [
    "auth_router",
    "users_router",
    "sources_router",
    "tenders_router",
    "documents_router",
    "crm_router",
    "prompts_router",
    "company_router",
    "alerts_router",
    "admin_router",
    "billing_router",
]
