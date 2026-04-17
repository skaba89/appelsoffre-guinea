"""TenderFlow Guinea — All models registration."""
from app.models.tenant import Tenant
from app.models.user import User
from app.models.membership import Membership
from app.models.audit import AuditLog
from app.models.source import Source, SourceRun
from app.models.tender import Tender, TenderDocument, TenderChunk, TenderScore
from app.models.category import Category, Tag, TenderTagLink
from app.models.company import CompanyProfile, Reference
from app.models.prompt import GeneratedPrompt
from app.models.crm import (
    CRMAccount, CRMContact, CRMOpportunity, CRMInteraction, CRMTask, CRMNote,
)
from app.models.alert import Alert, AlertConfig
from app.models.billing import Subscription, BillingEvent
from app.models.generated_document import GeneratedDocument

__all__ = [
    "Tenant",
    "User",
    "Membership",
    "AuditLog",
    "Source",
    "SourceRun",
    "Tender",
    "TenderDocument",
    "TenderChunk",
    "TenderScore",
    "Category",
    "Tag",
    "TenderTagLink",
    "CompanyProfile",
    "Reference",
    "GeneratedPrompt",
    "CRMAccount",
    "CRMContact",
    "CRMOpportunity",
    "CRMInteraction",
    "CRMTask",
    "CRMNote",
    "Alert",
    "AlertConfig",
    "Subscription",
    "BillingEvent",
    "GeneratedDocument",
]
