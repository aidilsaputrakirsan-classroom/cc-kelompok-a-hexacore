def test_register_success(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "StrongPass123!",
            "full_name": "New User",
            "role": "member",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert data["role"] == "member"
    assert "user_id" in data
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "StrongPass123!",
        "full_name": "Duplicate User",
        "role": "member",
    }
    client.post("/auth/register", json=payload)

    response = client.post("/auth/register", json=payload)

    assert response.status_code == 409


def test_login_success_returns_token(client):
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "StrongPass123!",
            "full_name": "Login User",
            "role": "member",
        },
    )

    response = client.post(
        "/auth/login",
        data={"username": "login@example.com", "password": "StrongPass123!"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login@example.com"


def test_login_wrong_password(client):
    client.post(
        "/auth/register",
        json={
            "email": "wrongpass@example.com",
            "password": "StrongPass123!",
            "full_name": "Wrong Password User",
            "role": "member",
        },
    )

    response = client.post(
        "/auth/login",
        data={"username": "wrongpass@example.com", "password": "WrongPass123!"},
    )

    assert response.status_code == 401


def test_auth_me_requires_valid_token(client, member_headers):
    response = client.get("/auth/me", headers=member_headers)

    assert response.status_code == 200
    assert response.json()["email"] == "member@example.com"


def test_auth_me_rejects_invalid_token(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer invalid-token"})

    assert response.status_code == 401


def test_register_weak_password_returns_validation_error(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "weakpass@example.com",
            "password": "weakpass",
            "full_name": "Weak Password",
            "role": "member",
        },
    )

    assert response.status_code == 422


def test_update_profile_success(client, member_headers):
    response = client.put(
        "/auth/me/profile",
        json={"full_name": "Updated Member"},
        headers=member_headers,
    )

    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Member"


def test_change_password_success(client, member_headers):
    response = client.put(
        "/auth/me/change-password",
        json={
            "current_password": "TestUser123!",
            "new_password": "NewPassword123!",
        },
        headers=member_headers,
    )

    assert response.status_code == 200

    login_response = client.post(
        "/auth/login",
        data={"username": "member@example.com", "password": "NewPassword123!"},
    )
    assert login_response.status_code == 200


def test_change_password_wrong_current_password(client, member_headers):
    response = client.put(
        "/auth/me/change-password",
        json={
            "current_password": "WrongPassword123!",
            "new_password": "NewPassword123!",
        },
        headers=member_headers,
    )

    assert response.status_code == 400
