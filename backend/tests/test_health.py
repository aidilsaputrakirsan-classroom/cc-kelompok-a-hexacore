def test_health_check_includes_database_status(client):
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "backend"
    assert data["app"] == "LenteraPustaka"
    assert data["database"] == "connected"


def test_team_info_endpoint(client):
    response = client.get("/team")

    assert response.status_code == 200
    data = response.json()
    assert data["team"] == "cloud-team-hexacore"
    assert data["app"] == "LenteraPustaka"
    assert len(data["members"]) == 4
