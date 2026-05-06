def test_create_category_success(client, admin_headers):
    response = client.post(
        "/categories",
        json={"name": "Fiksi", "description": "Buku fiksi dan novel"},
        headers=admin_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Fiksi"
    assert "category_id" in data


def test_create_category_requires_admin(client, member_headers):
    response = client.post(
        "/categories",
        json={"name": "Referensi", "description": "Buku referensi"},
        headers=member_headers,
    )

    assert response.status_code == 403


def test_list_categories_with_pagination(client, sample_category):
    response = client.get("/categories?skip=0&limit=10")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category_id"] == sample_category["category_id"]


def test_get_category_not_found(client):
    response = client.get("/categories/9999")

    assert response.status_code == 404


def test_update_category_not_found(client, admin_headers):
    response = client.put(
        "/categories/9999",
        json={"name": "Tidak Ada", "description": "Kategori tidak ada"},
        headers=admin_headers,
    )

    assert response.status_code == 404


def test_delete_category_not_found(client, admin_headers):
    response = client.delete("/categories/9999", headers=admin_headers)

    assert response.status_code == 404


def test_update_category_duplicate_name_returns_conflict(client, admin_headers, sample_category):
    create_response = client.post(
        "/categories",
        json={"name": "Referensi", "description": "Buku referensi"},
        headers=admin_headers,
    )
    assert create_response.status_code == 201

    response = client.put(
        f"/categories/{create_response.json()['category_id']}",
        json={"name": sample_category["name"], "description": "Nama duplikat"},
        headers=admin_headers,
    )

    assert response.status_code == 409


def test_create_duplicate_category_returns_conflict(client, admin_headers):
    payload = {"name": "Sains", "description": "Buku sains"}
    client.post("/categories", json=payload, headers=admin_headers)

    response = client.post("/categories", json=payload, headers=admin_headers)

    assert response.status_code == 409


def test_create_category_empty_name_returns_validation_error(client, admin_headers):
    response = client.post(
        "/categories",
        json={"name": "", "description": "Nama kategori kosong"},
        headers=admin_headers,
    )

    assert response.status_code == 422
