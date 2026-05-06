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
def second_member_headers(client):
    email = "second.member@example.com"
    register_user(client, email=email, full_name="Second Member", role="member")
    return login_headers(client, email)


@pytest.fixture
def admin_user(client, admin_headers):
    response = client.get("/auth/me", headers=admin_headers)
    assert response.status_code == 200
    return response.json()


@pytest.fixture
def member_user(client, member_headers):
    response = client.get("/auth/me", headers=member_headers)
    assert response.status_code == 200
    return response.json()


@pytest.fixture
def second_member_user(client, second_member_headers):
    response = client.get("/auth/me", headers=second_member_headers)
    assert response.status_code == 200
    return response.json()


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
def pending_transaction(client, member_headers, member_user, sample_book):
    response = client.post(
        "/transactions",
        json={
            "user_id": member_user["user_id"],
            "book_id": sample_book["book_id"],
        },
        headers=member_headers,
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def borrowed_transaction(client, admin_headers, pending_transaction):
    response = client.put(
        f"/transactions/{pending_transaction['transaction_id']}/approve",
        headers=admin_headers,
    )
    assert response.status_code == 200
    return response.json()


@pytest.fixture
def sample_fine(client, admin_headers, member_headers, borrowed_transaction):
    simulate_response = client.post(
        f"/transactions/{borrowed_transaction['transaction_id']}/simulate-overdue?days_late=3",
        headers=admin_headers,
    )
    assert simulate_response.status_code == 200

    return_response = client.put(
        f"/transactions/{borrowed_transaction['transaction_id']}/return",
        headers=member_headers,
    )
    assert return_response.status_code == 200

    fines_response = client.get("/fines", headers=member_headers)
    assert fines_response.status_code == 200
    fines = fines_response.json()["fines"]
    assert len(fines) == 1
    return fines[0]


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
