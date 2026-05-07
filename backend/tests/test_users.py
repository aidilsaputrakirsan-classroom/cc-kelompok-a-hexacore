def test_admin_can_list_users(client, admin_headers):
    response = client.get("/users", headers=admin_headers)

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_member_cannot_list_users(client, member_headers):
    response = client.get("/users", headers=member_headers)

    assert response.status_code == 403


def test_admin_can_get_any_user_detail(client, admin_headers, member_user):
    response = client.get(f"/users/{member_user['user_id']}", headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["email"] == member_user["email"]


def test_member_can_get_own_detail(client, member_headers, member_user):
    response = client.get(f"/users/{member_user['user_id']}", headers=member_headers)

    assert response.status_code == 200
    assert response.json()["email"] == member_user["email"]


def test_member_cannot_get_other_user_detail(client, member_headers, second_member_user):
    response = client.get(f"/users/{second_member_user['user_id']}", headers=member_headers)

    assert response.status_code == 403


def test_admin_can_update_user(client, admin_headers, member_user):
    response = client.put(
        f"/users/{member_user['user_id']}",
        json={"full_name": "Updated By Admin", "role": "member"},
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated By Admin"


def test_get_user_not_found(client, admin_headers):
    response = client.get("/users/9999", headers=admin_headers)

    assert response.status_code == 404


def test_update_user_not_found(client, admin_headers):
    response = client.put(
        "/users/9999",
        json={"full_name": "Missing User"},
        headers=admin_headers,
    )

    assert response.status_code == 404


def test_update_user_duplicate_email_returns_conflict(client, admin_headers, member_user, second_member_user):
    response = client.put(
        f"/users/{second_member_user['user_id']}",
        json={"email": member_user["email"]},
        headers=admin_headers,
    )

    assert response.status_code == 409


def test_admin_can_reset_user_password(client, admin_headers, member_user):
    response = client.put(
        f"/users/{member_user['user_id']}/reset-password",
        json={"new_password": "ResetPass123!"},
        headers=admin_headers,
    )

    assert response.status_code == 200

    login_response = client.post(
        "/auth/login",
        data={"username": member_user["email"], "password": "ResetPass123!"},
    )
    assert login_response.status_code == 200


def test_admin_reset_password_user_not_found(client, admin_headers):
    response = client.put(
        "/users/9999/reset-password",
        json={"new_password": "ResetPass123!"},
        headers=admin_headers,
    )

    assert response.status_code == 404


def test_delete_user_success(client, admin_headers, member_user):
    response = client.delete(f"/users/{member_user['user_id']}", headers=admin_headers)

    assert response.status_code == 204


def test_delete_user_not_found(client, admin_headers):
    response = client.delete("/users/9999", headers=admin_headers)

    assert response.status_code == 404
