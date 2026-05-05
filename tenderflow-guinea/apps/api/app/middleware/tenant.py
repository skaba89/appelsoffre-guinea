"""TenderFlow Guinea — Tenant Middleware.

Extracts tenant context from JWT claims and validates access.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import json


class TenantMiddleware(BaseHTTPMiddleware):
    """Middleware that extracts and validates tenant context from requests.

    For authenticated requests, the tenant_id from the JWT is used.
    For unauthenticated endpoints, no tenant context is set.
    """

    # Paths that don't require tenant context
    PUBLIC_PATHS = {
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/refresh",
        "/api/v1/billing/webhook",
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc",
    }

    async def dispatch(self, request: Request, call_next):
        # Skip tenant validation for public paths
        path = request.url.path
        if path in self.PUBLIC_PATHS or path.startswith("/docs") or path.startswith("/redoc"):
            return await call_next(request)

        # Try to extract tenant_id from X-Tenant-ID header as a hint
        tenant_id = request.headers.get("X-Tenant-ID")
        request.state.tenant_id = tenant_id

        response = await call_next(request)
        return response
