# API Contract — LenteraPustaka Microservices (Hexacore)

Dokumen ini memuat kontrak API resmi untuk layanan microservices **LenteraPustaka** yang berjalan melalui **API Gateway (Nginx)** pada port `80`.

---

## 🌐 Base URLs

| Environment | Base URL |
|---|---|
| **Local Development** | `http://localhost` |
| **Production** | `https://[nama-app].up.railway.app` |

---

## 🔒 Authentication & Error Format

Semua endpoint yang terproteksi membutuhkan header otorisasi JWT:
```http
Authorization: Bearer <access_token>
```

### Format Respon Error (Standard)
Semua service mengembalikan format error JSON standar:
```json
{
    "detail": "Pesan deskripsi kesalahan"
}
```

| HTTP Status Code | Deskripsi |
|---|---|
| **200 OK** | Request sukses diproses. |
| **201 Created** | Data baru sukses dibuat. |
| **204 No Content** | Data sukses dihapus/diproses tanpa mengembalikan response body. |
| **400 Bad Request** | Request tidak valid atau kesalahan logika bisnis (misal: denda belum lunas). |
| **401 Unauthorized** | Token JWT tidak dikirimkan, tidak valid, atau sudah kadaluwarsa. |
| **403 Forbidden** | User tidak memiliki hak akses (Role tidak sesuai). |
| **404 Not Found** | Resource yang dicari tidak ditemukan. |
| **409 Conflict** | Terjadi duplikasi data unik (misal: Email atau ISBN sudah digunakan). |
| **422 Unprocessable Entity** | Validasi skema input (Pydantic) gagal. |
| **429 Too Many Requests** | Terkena limitasi rate limiting (Nginx). |
| **503 Service Unavailable** | Database mati atau service backend mati. |

---

## 🔐 Auth Service Endpoints (Gateway Prefix: `/auth` atau langsung `/users`, `/verify`, `/team`)

### 1. `POST /auth/register`
*   **Akses:** Publik
*   **Rate Limit:** 5 req/s (burst=5)
*   **Request Body:**
    ```json
    {
      "email": "budi@student.itk.ac.id",
      "password": "PasswordKuat123!",
      "full_name": "Budi Santoso",
      "role": "member"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "user_id": 1,
      "email": "budi@student.itk.ac.id",
      "full_name": "Budi Santoso",
      "role": "member",
      "created_at": "2026-06-11T12:00:00Z"
    }
    ```

### 2. `POST /auth/login`
*   **Akses:** Publik
*   **Rate Limit:** 5 req/s (burst=10)
*   **Request Body:** (OAuth2 Form Data)
    *   `username`: "budi@student.itk.ac.id"
    *   `password`: "PasswordKuat123!"
*   **Response (200 OK):**
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
      "token_type": "bearer",
      "user": {
        "user_id": 1,
        "email": "budi@student.itk.ac.id",
        "full_name": "Budi Santoso",
        "role": "member",
        "created_at": "2026-06-11T12:00:00Z"
      }
    }
    ```

### 3. `GET /auth/me`
*   **Akses:** Terautentikasi (JWT)
*   **Response (200 OK):**
    ```json
    {
      "user_id": 1,
      "email": "budi@student.itk.ac.id",
      "full_name": "Budi Santoso",
      "role": "member",
      "created_at": "2026-06-11T12:00:00Z"
    }
    ```

### 4. `PUT /auth/me/change-password`
*   **Akses:** Terautentikasi (JWT)
*   **Request Body:**
    ```json
    {
      "current_password": "PasswordKuat123!",
      "new_password": "PasswordBaruLagi99!"
    }
    ```
*   **Response (200 OK):** UserResponse JSON

### 5. `PUT /auth/me/profile`
*   **Akses:** Terautentikasi (JWT)
*   **Request Body:**
    ```json
    {
      "full_name": "Nama Baru Budi"
    }
    ```
*   **Response (200 OK):** UserResponse JSON

### 6. `GET /users`
*   **Akses:** Admin Only (JWT)
*   **Query Parameters:**
    *   `skip` (default 0)
    *   `limit` (default 50)
*   **Response (200 OK):** Array of UserResponse JSONs

### 7. `GET /users/{user_id}`
*   **Akses:** Internal & Admin (JWT)
*   **Response (200 OK):** UserResponse JSON

### 8. `PUT /users/{user_id}`
*   **Akses:** Admin Only (JWT)
*   **Request Body:** Partial update fields (`email`, `full_name`, `role` opsional)
*   **Response (200 OK):** UserResponse JSON

### 9. `DELETE /users/{user_id}`
*   **Akses:** Admin Only (JWT)
*   **Response (204 No Content)**

### 10. `PUT /users/{user_id}/reset-password`
*   **Akses:** Admin Only (JWT)
*   **Request Body:**
    ```json
    {
      "new_password": "ResetPasswordAdmin123!"
    }
    ```
*   **Response (200 OK):** UserResponse JSON

### 11. `GET /verify` (Internal)
*   **Akses:** Internal communication saja (library-service memanggil ini ke auth-service)
*   **Header:** `Authorization: Bearer <token>`
*   **Response (200 OK):**
    ```json
    {
      "user_id": 1,
      "email": "budi@student.itk.ac.id",
      "full_name": "Budi Santoso",
      "role": "member"
    }
    ```

---

## 📦 Library Service Endpoints (Gateway Prefix: `/books`, `/categories`, `/genres`, `/transactions`, `/fines`, `/upload`, `/static`)

### 1. `GET /books`
*   **Akses:** Publik
*   **Query Parameters:**
    *   `search` (pencarian teks pada judul/penulis/ISBN)
    *   `category_id` (filter ID Kategori)
    *   `skip` (offset)
    *   `limit` (jumlah data)
*   **Response (200 OK):**
    ```json
    {
      "total": 1,
      "books": [
        {
          "book_id": 1,
          "category_id": 2,
          "genres": [{"genre_id": 1, "name": "Horor", "description": ""}],
          "isbn": "978-602-03-3446-5",
          "title": "Laskar Pelangi",
          "author": "Andrea Hirata",
          "publisher": "Bentang Pustaka",
          "publication_year": 2005,
          "synopsis": "Kisah perjuangan anak Belitung...",
          "cover_image_url": "http://localhost/static/covers/default.png",
          "total_stock": 5,
          "available_stock": 5,
          "is_public": true
        }
      ]
    }
    ```

### 2. `POST /books`
*   **Akses:** Admin Only (JWT)
*   **Request Body:**
    ```json
    {
      "category_id": 2,
      "genre_ids": [1],
      "isbn": "978-602-03-3446-5",
      "title": "Laskar Pelangi",
      "author": "Andrea Hirata",
      "publisher": "Bentang Pustaka",
      "publication_year": 2005,
      "synopsis": "Kisah perjuangan anak Belitung...",
      "cover_image_url": null,
      "total_stock": 5,
      "available_stock": 5,
      "is_public": true
    }
    ```
*   **Response (201 Created):** BookResponse JSON

### 3. `GET /books/{book_id}`
*   **Akses:** Publik
*   **Response (200 OK):** BookResponse JSON

### 4. `PUT /books/{book_id}`
*   **Akses:** Admin Only (JWT)
*   **Request Body:** Partial update fields (`isbn`, `title`, `available_stock`, dll.)
*   **Response (200 OK):** BookResponse JSON

### 5. `DELETE /books/{book_id}`
*   **Akses:** Admin Only (JWT)
*   **Response (204 No Content)**

### 6. `POST /categories`
*   **Akses:** Admin Only (JWT)
*   **Request Body:** `{"name": "Fiksi", "description": "Buku novel"}`
*   **Response (201 Created):** CategoryResponse JSON

### 7. `PUT /categories/{category_id}`
*   **Akses:** Admin Only (JWT)
*   **Request Body:** `{"name": "Fiksi Baru", "description": "Deskripsi baru"}`
*   **Response (200 OK):** CategoryResponse JSON

### 8. `POST /genres`
*   **Akses:** Admin Only (JWT)
*   **Request Body:** `{"name": "Misteri", "description": "Teka-teki"}`
*   **Response (201 Created):** GenreResponse JSON

### 9. `PUT /genres/{genre_id}`
*   **Akses:** Admin Only (JWT)
*   **Request Body:** `{"name": "Misteri Baru", "description": "Deskripsi baru"}`
*   **Response (200 OK):** GenreResponse JSON

### 10. `POST /transactions`
*   **Akses:** Terautentikasi (JWT)
*   **Request Body:**
    ```json
    {
      "user_id": 1,
      "book_id": 1
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "transaction_id": 1,
      "user_id": 1,
      "book_id": 1,
      "borrow_date": "2026-06-11T12:00:00Z",
      "due_date": "2026-06-18T12:00:00Z",
      "return_date": null,
      "status": "pending"
    }
    ```

### 11. `PUT /transactions/{transaction_id}/approve`
*   **Akses:** Admin Only (JWT)
*   **Response (200 OK):** TransactionResponse JSON (status berubah ke `borrowed`, stok berkurang)

### 12. `PUT /transactions/{transaction_id}/reject`
*   **Akses:** Admin Only (JWT)
*   **Response (200 OK):** TransactionResponse JSON (status berubah ke `rejected`)

### 13. `PUT /transactions/{transaction_id}/return`
*   **Akses:** Admin Only (JWT)
*   **Response (200 OK):** TransactionResponse JSON (status `returned` jika tepat waktu, atau `overdue` jika terlambat denda akan dibuat)

### 14. `POST /transactions/{transaction_id}/lost`
*   **Akses:** Terautentikasi (JWT)
*   **Response (200 OK):** TransactionResponse JSON (status `lost` denda fix 100rb akan ditambahkan)

### 15. `GET /fines`
*   **Akses:** Terautentikasi (JWT)
*   **Query Parameters:**
    *   `status_filter` (unpaid / pending_verification / paid / rejected)
    *   `user_id` (admin bisa memfilter spesifik user)
*   **Response (200 OK):** List denda user

### 16. `POST /fines/{fine_id}/submit-payment`
*   **Akses:** Terautentikasi (JWT)
*   **Request Body:**
    ```json
    {
      "payment_proof_url": "http://localhost/static/proofs/bukti-transfer.png"
    }
    ```
*   **Response (200 OK):** FineResponse JSON (status berubah ke `pending_verification`)

### 17. `PUT /fines/{fine_id}/approve`
*   **Akses:** Admin Only (JWT)
*   **Response (200 OK):** FineResponse (status berubah ke `paid`)

### 18. `PUT /fines/{fine_id}/reject`
*   **Akses:** Admin Only (JWT)
*   **Request Body:** `{"rejection_note": "Bukti tidak terbaca"}`
*   **Response (200 OK):** FineResponse (status berubah ke `rejected`)

---

## 📊 System Health & Monitoring Endpoints

### 1. `GET /health` (Gateway / Library)
*   **Akses:** Publik
*   **Response (200 OK / 503 Service Unavailable):**
    ```json
    {
      "status": "healthy",
      "service": "library-service",
      "database": "connected"
    }
    ```

### 2. `GET /auth/health`
*   **Akses:** Publik
*   **Response (200 OK / 503 Service Unavailable):**
    ```json
    {
      "status": "healthy",
      "service": "auth-service",
      "database": "connected"
    }
    ```

### 3. `GET /auth/metrics`
*   **Akses:** Publik
*   **Response (200 OK):** JSON metrik performa Auth Service

### 4. `GET /library/metrics`
*   **Akses:** Publik
*   **Response (200 OK):** JSON metrik performa Library Service
