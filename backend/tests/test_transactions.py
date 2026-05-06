def test_member_can_create_borrow_transaction(client, member_headers, member_user, sample_book):
    response = client.post(
        "/transactions",
        json={"user_id": member_user["user_id"], "book_id": sample_book["book_id"]},
        headers=member_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "pending"
    assert data["user_id"] == member_user["user_id"]
    assert data["book_id"] == sample_book["book_id"]


def test_member_cannot_borrow_for_another_user(
    client,
    member_headers,
    second_member_user,
    sample_book,
):
    response = client.post(
        "/transactions",
        json={"user_id": second_member_user["user_id"], "book_id": sample_book["book_id"]},
        headers=member_headers,
    )

    assert response.status_code == 403


def test_admin_can_approve_transaction(client, admin_headers, pending_transaction):
    response = client.put(
        f"/transactions/{pending_transaction['transaction_id']}/approve",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "borrowed"


def test_admin_can_reject_transaction(client, admin_headers, pending_transaction):
    response = client.put(
        f"/transactions/{pending_transaction['transaction_id']}/reject",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "rejected"


def test_approve_transaction_not_found(client, admin_headers):
    response = client.put("/transactions/9999/approve", headers=admin_headers)

    assert response.status_code == 404


def test_reject_transaction_not_found(client, admin_headers):
    response = client.put("/transactions/9999/reject", headers=admin_headers)

    assert response.status_code == 404


def test_approve_transaction_invalid_status_returns_404(client, admin_headers, borrowed_transaction):
    response = client.put(
        f"/transactions/{borrowed_transaction['transaction_id']}/approve",
        headers=admin_headers,
    )

    assert response.status_code == 404


def test_reject_transaction_invalid_status_returns_404(client, admin_headers, borrowed_transaction):
    response = client.put(
        f"/transactions/{borrowed_transaction['transaction_id']}/reject",
        headers=admin_headers,
    )

    assert response.status_code == 404


def test_member_lists_only_own_transactions(
    client,
    member_headers,
    second_member_headers,
    second_member_user,
    sample_book,
    pending_transaction,
):
    other_response = client.post(
        "/transactions",
        json={"user_id": second_member_user["user_id"], "book_id": sample_book["book_id"]},
        headers=second_member_headers,
    )
    assert other_response.status_code == 201

    response = client.get("/transactions", headers=member_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["transactions"][0]["transaction_id"] == pending_transaction["transaction_id"]


def test_admin_lists_all_transactions(
    client,
    admin_headers,
    second_member_headers,
    second_member_user,
    sample_book,
    pending_transaction,
):
    other_response = client.post(
        "/transactions",
        json={"user_id": second_member_user["user_id"], "book_id": sample_book["book_id"]},
        headers=second_member_headers,
    )
    assert other_response.status_code == 201

    response = client.get("/transactions", headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["total"] == 2


def test_get_transaction_detail_success(client, member_headers, pending_transaction):
    response = client.get(
        f"/transactions/{pending_transaction['transaction_id']}",
        headers=member_headers,
    )

    assert response.status_code == 200
    assert response.json()["transaction_id"] == pending_transaction["transaction_id"]


def test_get_transaction_not_found(client, member_headers):
    response = client.get("/transactions/9999", headers=member_headers)

    assert response.status_code == 404


def test_return_borrowed_book_success(client, member_headers, borrowed_transaction):
    response = client.put(
        f"/transactions/{borrowed_transaction['transaction_id']}/return",
        headers=member_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "returned"


def test_return_pending_transaction_returns_bad_request(client, member_headers, pending_transaction):
    response = client.put(
        f"/transactions/{pending_transaction['transaction_id']}/return",
        headers=member_headers,
    )

    assert response.status_code == 400


def test_return_transaction_for_other_user_forbidden(client, second_member_headers, borrowed_transaction):
    response = client.put(
        f"/transactions/{borrowed_transaction['transaction_id']}/return",
        headers=second_member_headers,
    )

    assert response.status_code == 403


def test_simulate_overdue_not_found(client, admin_headers):
    response = client.post("/transactions/9999/simulate-overdue", headers=admin_headers)

    assert response.status_code == 404


def test_report_lost_book_success(client, member_headers, borrowed_transaction):
    response = client.post(
        f"/transactions/{borrowed_transaction['transaction_id']}/lost",
        headers=member_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "lost"


def test_report_lost_book_not_found(client, member_headers):
    response = client.post("/transactions/9999/lost", headers=member_headers)

    assert response.status_code == 404


def test_report_lost_pending_transaction_returns_bad_request(
    client,
    member_headers,
    pending_transaction,
):
    response = client.post(
        f"/transactions/{pending_transaction['transaction_id']}/lost",
        headers=member_headers,
    )

    assert response.status_code == 400


def test_report_lost_transaction_for_other_user_forbidden(
    client,
    second_member_headers,
    borrowed_transaction,
):
    response = client.post(
        f"/transactions/{borrowed_transaction['transaction_id']}/lost",
        headers=second_member_headers,
    )

    assert response.status_code == 403


def test_borrow_fails_when_stock_empty(client, member_headers, member_user, sample_book):
    response = client.put(
        f"/books/{sample_book['book_id']}",
        json={"total_stock": 1, "available_stock": 0},
        headers=member_headers,
    )
    assert response.status_code == 403

    admin_response = client.post(
        "/auth/register",
        json={
            "email": "stock.admin@example.com",
            "password": "TestUser123!",
            "full_name": "Stock Admin",
            "role": "admin",
        },
    )
    assert admin_response.status_code == 201
    admin_login = client.post(
        "/auth/login",
        data={"username": "stock.admin@example.com", "password": "TestUser123!"},
    )
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    update_response = client.put(
        f"/books/{sample_book['book_id']}",
        json={"total_stock": 1, "available_stock": 0},
        headers=admin_headers,
    )
    assert update_response.status_code == 200

    borrow_response = client.post(
        "/transactions",
        json={"user_id": member_user["user_id"], "book_id": sample_book["book_id"]},
        headers=member_headers,
    )

    assert borrow_response.status_code == 400
