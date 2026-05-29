"""
Integration Test Configuration.
Tests ini membutuhkan semua services running di Docker Compose.
"""
import os
import pytest
import httpx

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost")


@pytest.fixture(scope="session")
def gateway_url():
    """Base URL gateway."""
    return GATEWAY_URL


@pytest.fixture(scope="session")
def test_admin_headers(gateway_url):
    """
    Login as default admin (created during seeder/startup) and return headers.
    """
    # Mencoba login dengan email default admin
    # (Di kelompok HEXACORE, Anda bisa menyesuaikan email admin bawaan Anda)
    email = "admin@lenterapustaka.com"
    password = "adminpassword"
    
    try:
        response = httpx.post(
            f"{gateway_url}/auth/login",
            data={"username": email, "password": password},
            timeout=5.0
        )
        if response.status_code == 200:
            token = response.json()["access_token"]
            return {"Authorization": f"Bearer {token}"}
    except Exception:
        pass
    return None


@pytest.fixture(scope="session")
def test_user(gateway_url):
    """Register test user dan return credentials + token."""
    import uuid
    email = f"integration-test-{uuid.uuid4()}@example.com"
    password = "IntegrationTestPass123!"
    name = "Integration Test User"

    # Register
    response = httpx.post(
        f"{gateway_url}/auth/register",
        json={"email": email, "password": password, "full_name": name},
        timeout=5.0
    )
    assert response.status_code == 201, f"Register failed: {response.text}"

    # Login (Menggunakan Form Data sesuai OAuth2PasswordRequestForm di auth-service)
    response = httpx.post(
        f"{gateway_url}/auth/login",
        data={"username": email, "password": password},
        timeout=5.0
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]
    user_id = response.json()["user"]["user_id"]

    return {
        "user_id": user_id,
        "email": email,
        "password": password,
        "name": name,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }
