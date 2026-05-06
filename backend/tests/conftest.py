import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite://"
os.environ.setdefault("SECRET_KEY", "test-secret-key")

from database import Base, get_db  # noqa: E402
from main import app  # noqa: E402


SQLALCHEMY_TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def register_user(client, email, password="TestUser123!", full_name="Test User", role="member"):
    return client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": role,
        },
    )


def login_headers(client, email, password="TestUser123!"):
    response = client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client):
    email = "admin@example.com"
    register_user(client, email=email, full_name="Admin User", role="admin")
    return login_headers(client, email)


@pytest.fixture
def member_headers(client):
    email = "member@example.com"
    register_user(client, email=email, full_name="Member User", role="member")
    return login_headers(client, email)


@pytest.fixture
def sample_category(client, admin_headers):
    response = client.post(
        "/categories",
        json={"name": "Teknologi", "description": "Buku teknologi dan komputasi"},
        headers=admin_headers,
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def sample_genre(client, admin_headers):
    response = client.post(
        "/genres",
        json={"name": "Cloud Computing", "description": "Topik komputasi awan"},
        headers=admin_headers,
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def sample_book(client, admin_headers, sample_category, sample_genre):
    response = client.post(
        "/books",
        json={
            "category_id": sample_category["category_id"],
            "genre_ids": [sample_genre["genre_id"]],
            "isbn": "978-602-001",
            "title": "Dasar Cloud Native",
            "author": "Hexacore Team",
            "publisher": "LenteraPustaka",
            "publication_year": 2026,
            "synopsis": "Panduan dasar aplikasi cloud-native.",
            "total_stock": 4,
            "available_stock": 4,
        },
        headers=admin_headers,
    )
    assert response.status_code == 201
    return response.json()
