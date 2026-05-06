from unittest.mock import mock_open

def test_upload_fine_proof_success(client, member_headers, monkeypatch):
    file_writer = mock_open()
    monkeypatch.setattr("builtins.open", file_writer)

    response = client.post(
        "/upload/fines",
        files={"file": ("proof.png", b"fake image bytes", "image/png")},
        headers=member_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["url"].startswith("/static/fines/")
    file_writer().write.assert_called_once_with(b"fake image bytes")


def test_upload_fine_proof_save_failure_returns_500(client, member_headers, monkeypatch):
    failing_open = mock_open()
    failing_open.side_effect = OSError("disk full")
    monkeypatch.setattr("builtins.open", failing_open)

    response = client.post(
        "/upload/fines",
        files={"file": ("proof.png", b"fake image bytes", "image/png")},
        headers=member_headers,
    )

    assert response.status_code == 500


def test_upload_fine_proof_rejects_non_image(client, member_headers):
    response = client.post(
        "/upload/fines",
        files={"file": ("proof.txt", b"not an image", "text/plain")},
        headers=member_headers,
    )

    assert response.status_code == 400


def test_upload_book_cover_success(client, admin_headers, monkeypatch):
    file_writer = mock_open()
    monkeypatch.setattr("builtins.open", file_writer)

    response = client.post(
        "/upload/covers",
        files={"file": ("cover.jpg", b"fake image bytes", "image/jpeg")},
        headers=admin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["url"].startswith("/static/covers/")
    file_writer().write.assert_called_once_with(b"fake image bytes")


def test_upload_book_cover_save_failure_returns_500(client, admin_headers, monkeypatch):
    failing_open = mock_open()
    failing_open.side_effect = OSError("disk full")
    monkeypatch.setattr("builtins.open", failing_open)

    response = client.post(
        "/upload/covers",
        files={"file": ("cover.jpg", b"fake image bytes", "image/jpeg")},
        headers=admin_headers,
    )

    assert response.status_code == 500


def test_upload_book_cover_rejects_member_access(client, member_headers):
    response = client.post(
        "/upload/covers",
        files={"file": ("cover.jpg", b"fake image bytes", "image/jpeg")},
        headers=member_headers,
    )

    assert response.status_code == 403


def test_upload_book_cover_rejects_non_image(client, admin_headers):
    response = client.post(
        "/upload/covers",
        files={"file": ("cover.txt", b"not an image", "text/plain")},
        headers=admin_headers,
    )

    assert response.status_code == 400
