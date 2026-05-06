def test_create_genre_success(client, admin_headers):
    response = client.post(
        "/genres",
        json={"name": "Fantasi", "description": "Cerita fantasi"},
        headers=admin_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Fantasi"
    assert "genre_id" in data


def test_create_genre_requires_admin(client, member_headers):
    response = client.post(
        "/genres",
        json={"name": "Drama", "description": "Cerita drama"},
        headers=member_headers,
    )

    assert response.status_code == 403


def test_list_genres(client, sample_genre):
    response = client.get("/genres")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["genre_id"] == sample_genre["genre_id"]


def test_get_genre_by_id(client, sample_genre):
    response = client.get(f"/genres/{sample_genre['genre_id']}")

    assert response.status_code == 200
    assert response.json()["name"] == sample_genre["name"]


def test_get_genre_not_found(client):
    response = client.get("/genres/9999")

    assert response.status_code == 404


def test_update_genre_success(client, admin_headers, sample_genre):
    response = client.put(
        f"/genres/{sample_genre['genre_id']}",
        json={"name": "Cloud Native", "description": "Genre cloud native"},
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Cloud Native"


def test_update_genre_not_found(client, admin_headers):
    response = client.put(
        "/genres/9999",
        json={"name": "Tidak Ada", "description": "Genre tidak ada"},
        headers=admin_headers,
    )

    assert response.status_code == 404


def test_update_genre_duplicate_name_returns_conflict(client, admin_headers, sample_genre):
    create_response = client.post(
        "/genres",
        json={"name": "Referensi", "description": "Genre referensi"},
        headers=admin_headers,
    )
    assert create_response.status_code == 201

    response = client.put(
        f"/genres/{create_response.json()['genre_id']}",
        json={"name": sample_genre["name"], "description": "Nama duplikat"},
        headers=admin_headers,
    )

    assert response.status_code == 409


def test_delete_genre_success(client, admin_headers, sample_genre):
    response = client.delete(f"/genres/{sample_genre['genre_id']}", headers=admin_headers)

    assert response.status_code == 204

    get_response = client.get(f"/genres/{sample_genre['genre_id']}")
    assert get_response.status_code == 404


def test_delete_genre_not_found(client, admin_headers):
    response = client.delete("/genres/9999", headers=admin_headers)

    assert response.status_code == 404


def test_create_duplicate_genre_returns_conflict(client, admin_headers):
    payload = {"name": "Misteri", "description": "Cerita misteri"}
    client.post("/genres", json=payload, headers=admin_headers)

    response = client.post("/genres", json=payload, headers=admin_headers)

    assert response.status_code == 409
