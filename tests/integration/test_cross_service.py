"""
Integration Tests — Verifikasi komunikasi antar services.
Jalankan dengan: pytest tests/integration/ -v
Syarat: docker compose up -d (semua services running)
"""
import httpx
import pytest


def test_gateway_health(gateway_url):
    """Test 1: Gateway / Nginx bisa diakses."""
    # Gateway mem-forward /health ke library-service
    response = httpx.get(f"{gateway_url}/health")
    assert response.status_code in [200, 503]


def test_auth_service_health(gateway_url):
    """Test 2: Auth Service health check secara langsung."""
    # Port 8001 diekspos di docker-compose.yml
    response = httpx.get("http://localhost:8001/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "auth-service"
    assert data["status"] == "healthy"


def test_library_service_health(gateway_url):
    """Test 3: Library Service health check via gateway."""
    response = httpx.get(f"{gateway_url}/health")
    assert response.status_code in [200, 503]
    data = response.json()
    assert data["service"] == "library-service"


def test_register_login_flow(gateway_url):
    """Test 4: Alur lengkap register → login via Gateway."""
    import uuid
    email = f"flow-test-{uuid.uuid4()}@example.com"

    # Register
    resp = httpx.post(
        f"{gateway_url}/auth/register", 
        json={"email": email, "password": "FlowTestPass123!", "full_name": "Flow User"}
    )
    assert resp.status_code == 201
    assert resp.json()["email"] == email

    # Login
    resp = httpx.post(
        f"{gateway_url}/auth/login", 
        data={"username": email, "password": "FlowTestPass123!"}
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()
    assert resp.json()["token_type"] == "bearer"


def test_get_profile_with_token(gateway_url, test_user):
    """Test 5: Mengambil data profil (/auth/me) menggunakan JWT token."""
    resp = httpx.get(
        f"{gateway_url}/auth/me",
        headers=test_user["headers"]
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == test_user["email"]


def test_cross_service_transaction_auth(gateway_url, test_user):
    """Test 6: Library Service memverifikasi eksistensi user ke Auth Service saat transaksi."""
    # Sebelum membuat transaksi peminjaman, pastikan ada buku di database library-service.
    # Kita panggil GET /books untuk mencari ID Buku yang valid
    resp_books = httpx.get(f"{gateway_url}/books")
    assert resp_books.status_code == 200
    books_data = resp_books.json()["books"]
    
    if not books_data:
        pytest.skip("Tidak ada buku di database perpustakaan untuk menguji peminjaman.")
        
    book_id = books_data[0]["book_id"]
    
    # Buat transaksi peminjaman (library-service akan memanggil check_user_exists ke auth-service secara internal)
    resp_trx = httpx.post(
        f"{gateway_url}/transactions",
        json={"user_id": test_user["user_id"], "book_id": book_id},
        headers=test_user["headers"]
    )
    # Status code 201 Created atau 400 Bad Request jika stok habis/sudah pinjam
    assert resp_trx.status_code in [201, 400]


def test_unauthorized_without_token(gateway_url):
    """Test 7: Mengakses endpoint terproteksi tanpa token harus ditolak."""
    resp = httpx.post(
        f"{gateway_url}/transactions", 
        json={"user_id": 9999, "book_id": 1}
    )
    assert resp.status_code in [401, 422]


def test_invalid_token_rejected(gateway_url):
    """Test 8: Menggunakan token palsu/invalid harus ditolak."""
    resp = httpx.get(
        f"{gateway_url}/transactions",
        headers={"Authorization": "Bearer token-palsu-invalid"}
    )
    assert resp.status_code == 401


def test_get_public_items(gateway_url):
    """Test 9: Mendapatkan daftar item publik (/items/public) tanpa memerlukan otorisasi."""
    resp = httpx.get(f"{gateway_url}/items/public")
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "books" in data
    # Kriteria: setiap buku yang dikembalikan harus bertipe publik (is_public=True)
    for book in data["books"]:
        assert book["is_public"] is True


def test_get_items_stats_auth_needed_normally(gateway_url):
    """Test 10: Mengakses statistik item (/items/stats) tanpa token secara normal (UP) harus ditolak."""
    # Selama Auth Service UP, endpoint stats dilindungi auth
    resp = httpx.get(f"{gateway_url}/items/stats")
    assert resp.status_code == 401


def test_get_items_stats_authorized_normally(gateway_url, test_user):
    """Test 11: Mengakses statistik item (/items/stats) dengan token valid secara normal harus berhasil."""
    resp = httpx.get(
        f"{gateway_url}/items/stats",
        headers=test_user["headers"]
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_items" in data
    assert "total_value" in data
