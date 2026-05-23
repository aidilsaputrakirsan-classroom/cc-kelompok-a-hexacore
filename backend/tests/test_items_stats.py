def test_get_items_stats(client, admin_headers, sample_fine):
    """Menguji endpoint GET /items/stats."""
    response = client.get("/items/stats", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_items" in data
    assert "total_value" in data
    assert "termahal" in data
    assert "termurah" in data
    assert data["total_items"] >= 1
    assert data["total_value"] == sample_fine["amount"]


def test_get_fines_stats(client, admin_headers, sample_fine):
    """Menguji endpoint GET /fines/stats."""
    response = client.get("/fines/stats", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_items" in data
    assert "total_value" in data
    assert "termahal" in data
    assert "termurah" in data
    assert data["total_items"] >= 1
    assert data["total_value"] == sample_fine["amount"]
