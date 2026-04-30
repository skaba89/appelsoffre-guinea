"""TenderFlow Guinea — Auth Endpoint Tests."""
import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    """Test the health check endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_root_endpoint(client):
    """Test the root endpoint."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_register_missing_fields(client):
    """Test registration with missing required fields."""
    response = await client.post("/api/v1/auth/register", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_email(client):
    """Test registration with invalid email."""
    response = await client.post("/api/v1/auth/register", json={
        "email": "not-an-email",
        "password": "testpassword123",
        "full_name": "Test User",
        "tenant_name": "Test Org",
        "tenant_slug": "test-org",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    """Test login with a user that doesn't exist."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent@test.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_unauthenticated_access(client):
    """Test that protected endpoints require authentication."""
    response = await client.get("/api/v1/tenders")
    assert response.status_code == 401
