def test_create_book_success(client, admin_headers, sample_category, sample_genre):
    response = client.post(
        "/books",
        json={
            "category_id": sample_category["category_id"],
            "genre_ids": [sample_genre["genre_id"]],
            "isbn": "978-602-010",
            "title": "Testing Backend FastAPI",
            "author": "Lead Backend",
            "publisher": "Hexacore Press",
            "publication_year": 2026,
            "total_stock": 3,
            "available_stock": 3,
        },
        headers=admin_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Testing Backend FastAPI"
    assert data["category_id"] == sample_category["category_id"]
    assert data["genres"][0]["genre_id"] == sample_genre["genre_id"]


def test_create_book_unauthorized_for_member(client, member_headers, sample_category):
    response = client.post(
        "/books",
        json={
            "category_id": sample_category["category_id"],
            "title": "Member Cannot Create",
            "author": "Member",
            "total_stock": 1,
            "available_stock": 1,
        },
        headers=member_headers,
    )

    assert response.status_code == 403


def test_get_books_returns_total_and_books(client, sample_book):
    response = client.get("/books")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["books"][0]["book_id"] == sample_book["book_id"]


def test_get_books_pagination_limit_two(client, admin_headers, sample_category):
    for index in range(3):
        response = client.post(
            "/books",
            json={
                "category_id": sample_category["category_id"],
                "isbn": f"978-602-02{index}",
                "title": f"Cloud Architecture {index}",
                "author": "Hexacore Team",
                "total_stock": 2,
                "available_stock": 2,
            },
            headers=admin_headers,
        )
        assert response.status_code == 201

    response = client.get("/books?skip=0&limit=2")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["books"]) == 2


def test_search_books_by_title(client, sample_book):
    response = client.get("/books?search=Cloud")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["books"][0]["title"] == sample_book["title"]


def test_filter_books_by_category(client, sample_book, sample_category):
    response = client.get(f"/books?category_id={sample_category['category_id']}")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["books"][0]["category_id"] == sample_category["category_id"]


def test_get_book_not_found(client):
    response = client.get("/books/9999")

    assert response.status_code == 404


def test_update_book_stock(client, admin_headers, sample_book):
    response = client.put(
        f"/books/{sample_book['book_id']}",
        json={"total_stock": 5, "available_stock": 5},
        headers=admin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total_stock"] == 5
    assert data["available_stock"] == 5


def test_update_book_not_found(client, admin_headers):
    response = client.put(
        "/books/9999",
        json={"title": "Missing Book"},
        headers=admin_headers,
    )

    assert response.status_code == 404


def test_delete_book_success(client, admin_headers, sample_book):
    response = client.delete(f"/books/{sample_book['book_id']}", headers=admin_headers)

    assert response.status_code == 204

    get_response = client.get(f"/books/{sample_book['book_id']}")
    assert get_response.status_code == 404


def test_delete_book_not_found(client, admin_headers):
    response = client.delete("/books/9999", headers=admin_headers)

    assert response.status_code == 404


def test_create_book_duplicate_isbn_returns_conflict(client, admin_headers, sample_book):
    response = client.post(
        "/books",
        json={
            "category_id": sample_book["category_id"],
            "isbn": sample_book["isbn"],
            "title": "Duplicate ISBN",
            "author": "Hexacore Team",
            "total_stock": 1,
            "available_stock": 1,
        },
        headers=admin_headers,
    )

    assert response.status_code == 409


def test_get_books_invalid_limit_returns_validation_error(client):
    response = client.get("/books?limit=101")

    assert response.status_code == 422


def test_get_book_stats(client, sample_book):
    response = client.get("/books/stats")

    assert response.status_code == 200
    data = response.json()
    assert data["total_titles"] == 1
    assert data["total_stock"] == sample_book["total_stock"]
    assert data["available_stock"] == sample_book["available_stock"]
    assert data["borrowed_count"] == 0
    assert data["overdue_count"] == 0


def test_create_book_empty_title_returns_validation_error(client, admin_headers, sample_category):
    response = client.post(
        "/books",
        json={
            "category_id": sample_category["category_id"],
            "title": "",
            "author": "Invalid Input",
            "total_stock": 1,
            "available_stock": 1,
        },
        headers=admin_headers,
    )

    assert response.status_code == 422


def test_create_book_invalid_stock_returns_validation_error(client, admin_headers, sample_category):
    response = client.post(
        "/books",
        json={
            "category_id": sample_category["category_id"],
            "title": "Invalid Stock",
            "author": "Invalid Input",
            "total_stock": 1,
            "available_stock": 2,
        },
        headers=admin_headers,
    )

    assert response.status_code == 422
