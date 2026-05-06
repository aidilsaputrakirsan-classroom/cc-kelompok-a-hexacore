def test_member_can_list_own_fines(client, member_headers, sample_fine):
    response = client.get("/fines", headers=member_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["fines"][0]["fine_id"] == sample_fine["fine_id"]


def test_admin_can_list_all_fines(client, admin_headers, sample_fine):
    response = client.get("/fines", headers=admin_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["fines"][0]["fine_id"] == sample_fine["fine_id"]


def test_member_can_submit_fine_payment(client, member_headers, sample_fine):
    response = client.post(
        f"/fines/{sample_fine['fine_id']}/submit-payment",
        json={"payment_proof_url": "/static/fines/proof.png"},
        headers=member_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending_verification"
    assert data["payment_proof_url"] == "/static/fines/proof.png"


def test_member_cannot_submit_payment_for_other_user_fine(
    client,
    second_member_headers,
    sample_fine,
):
    response = client.post(
        f"/fines/{sample_fine['fine_id']}/submit-payment",
        json={"payment_proof_url": "/static/fines/other-proof.png"},
        headers=second_member_headers,
    )

    assert response.status_code == 403


def test_admin_can_approve_fine(client, admin_headers, sample_fine):
    submit_response = client.post(
        f"/fines/{sample_fine['fine_id']}/submit-payment",
        json={"payment_proof_url": "/static/fines/proof.png"},
        headers=admin_headers,
    )
    assert submit_response.status_code == 200

    response = client.put(f"/fines/{sample_fine['fine_id']}/approve", headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["status"] == "paid"


def test_approve_fine_not_found(client, admin_headers):
    response = client.put("/fines/9999/approve", headers=admin_headers)

    assert response.status_code == 404


def test_admin_can_reject_fine(client, admin_headers, sample_fine):
    response = client.put(
        f"/fines/{sample_fine['fine_id']}/reject",
        json={"rejection_note": "Bukti pembayaran tidak jelas"},
        headers=admin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "rejected"
    assert data["rejection_note"] == "Bukti pembayaran tidak jelas"


def test_reject_fine_not_found(client, admin_headers):
    response = client.put(
        "/fines/9999/reject",
        json={"rejection_note": "Denda tidak ditemukan"},
        headers=admin_headers,
    )

    assert response.status_code == 404


def test_fine_not_found_returns_404(client, member_headers):
    response = client.post(
        "/fines/9999/submit-payment",
        json={"payment_proof_url": "/static/fines/missing.png"},
        headers=member_headers,
    )

    assert response.status_code == 404
