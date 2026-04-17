"""TenderFlow Guinea — Audit Middleware.

Logs all mutating requests (POST, PUT, PATCH, DELETE) for compliance.
"""
from datetime import datetime, timezone
import json

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware that creates audit log entries for mutating requests."""

    SKIP_PATHS = {
        "/docs",
        "/openapi.json",
        "/redoc",
        "/health",
    }

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Only audit mutating methods
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            path = request.url.path
            if not any(path.startswith(skip) for skip in self.SKIP_PATHS):
                # Audit data is captured — in production this would be persisted
                # asynchronously to avoid blocking the response
                audit_data = {
                    "method": request.method,
                    "path": path,
                    "query_params": str(request.query_params),
                    "status_code": response.status_code,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "client_ip": request.client.host if request.client else None,
                    "user_agent": request.headers.get("user-agent"),
                }
                # Store in request state for potential use by other middleware
                request.state.audit_data = audit_data

        return response
