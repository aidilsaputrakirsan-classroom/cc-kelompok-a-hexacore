# 📚 API Documentation - LenteraPustaka (Hexacore)
Dokumentasi ini mencakup seluruh endpoint REST API yang tersedia pada sistem manajemen perpustakaan.

```
Base URL: http://localhost:8000/docs
```

## 🔑 Authentication
Aplikasi ini menggunakan JWT (JSON Web Token). Tambahkan header berikut untuk endpoint yang membutuhkan otentikasi:
`Authorization: Bearer <your_token>`

---

## 📌 API Summary (Quick Look)

### 1. Authentication & User Profile
Semua user (Admin/Member) harus mendaftar dan login untuk mendapatkan JWT Token.
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Mendaftarkan akun baru | No |
| `POST` | `/auth/login` | Mendapatkan JWT Token | No |
| `GET` | `/auth/me` | Mengambil data profil sendiri | No |
| `PUT` | `/auth/me/change-password` | Ganti password akun sendiri | No |
| `PUT` | `/auth/me` | Update foto/nama profil | No |

### 2. Books & Search (Public)
Endpoint untuk melihat koleksi buku yang tersedia.
#### A. Categories
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
|`GET`|`/categories`|	List semua kategori	| No
|`GET`|`/categories/{category_id}`|Detail informasi satu kategori buku | No

#### B. Genres
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
|`GET`|`/genres	`|List semua genre	| No
|`GET`|`/categories/{category_id}`|Detail informasi satu genre buku | No

#### C. Books
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
|`GET`|`/books	`|List semua buku (+ Search/Filter)	| No
|`GET`|`/books/{id}	`|Detail informasi satu buku	| No
|`GET`|`/books/stats	`|Lihat statistik buku (Populer dll)	| _❎ No / ✅ Yes ??? punye sape ni_


### 3. Books & Search (Member)
Endpoint untuk melihat koleksi buku yang tersedia dan meminjam, kurang lebih endpoint yang di lakukan guest bisa di lakukan oleh member dengan tambahan.
#### A. Transactions
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
|`POST` | /transactions | Melakukan pemminjaman buku | Yes
| `GET`| /transactions | Melihat transaksi peminjaman buku | Yes

#### B. Fines (Denda)
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
| `GET` | /fines | Melihat denda yang dimiliki member itu sendiri| Yes
|`POST`|/fines/{fine_id}/submit-payment | Member mengirimkan bukti pembayaran denda miliknya| Yes

### 4. Admin Management (Admin Only)
Endpoint ini digunakan untuk mengelola koleksi perpustakaan. Hanya boleh diakses akun dengan role Admin. Isinya adalah pengelolaan data master (CRUD) dan user.
#### A. Categories
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
|`POST`|`/categories`|Tambah kategori baru| Yes
|`PUT`|`/categories/{id}`|	Update kategori	| Yes
|`DELETE`|`/categories/{id}`|	Hapus kategori	| Yes

#### B. Genres
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
|`POST`|`/genres`|	Tambah genre baru	| Yes
|`PUT`|`/genres/{id}`|	Update genre	| Yes
|`DELETE`|`/genres/{id}`|	Hapus genre	| Yes

#### C. Books
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
|`POST`|`/books`|	Tambah buku baru	| Yes
|`PUT`|`/books/{id}`|	Update informasi buku	| Yes
|`DELETE`|`/books/{id}`|	Hapus buku dari sistem	| Yes

#### D. Users
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
|`GET`|`/users`|	List semua user di sistem	| Yes
|`DELETE`|`/users/{id}`|	Hapus akun user tertentu	| Yes
|`PUT`|`/users/{id}/reset-password`|	Reset password user lain	| Yes

### 5. Transactions & Fines (The Business Logic)
Alur peminjaman buku di LenteraPustaka

#### a. Sisi Member (User Journey):
1. Borrow: `POST /transactions` — Mengajukan pinjam buku.
2. Return: `PUT /transactions/{id}/return` — Mengajukan pengembalian.
3. Check Fine: `GET /fines` — Melihat daftar denda jika telat.
4. Pay Fine: `POST /fines/{id}/submit-payment` — Upload bukti bayar denda (Image).

#### b. Sisi Admin (Approval Journey):
1. Approve Borrow: `PUT /transactions/{id}/approve` — Konfirmasi peminjaman.
2. Reject Borrow: `PUT /transactions/{id}/reject` — Menolak peminjaman.
3. Approve Fine: `PUT /fines/{id}/approve` — Konfirmasi denda sudah lunas.
---

## 🛠️ API Details
### A. Member 
#### 1. Register
- URL: ``
- Method: ``
- Auth Required?: ✅ Yes  
- Request Body:
```

```
- Response (200 OK):
```

```

#### 2. Login
- URL: ``
- Method: ``
- Auth Required?: ✅ Yes  
- Request Body: `application/x-www-form-urlencoded`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| username | String | ✅ Yes | Username akun user |
| password | String | ✅ Yes | Password akun user |
| grant_type | String | ❌ No | Biasanya diisi password (OAuth2 standard) |

- Response (200 OK):
```
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0IiwiZXhwIjoxNzczOTk0ODY2fQ.DEA5kPvMooEevWdef6HkOOlLgc2Od0Tatdc_OaDDfkY",
  "token_type": "bearer",
  "user": {
    "user_id": 4,
    "email": "khanza@student.itk.ac.id",
    "full_name": "Khanza Nabila Tsabita",
    "role": "member",
    "created_at": "2026-03-19T02:59:33.885993+08:00"
  }
}
```

- curl
```
curl -X 'POST' \
  'http://localhost:8000/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&username=khanza%40student.itk.ac.id&password=Member%40123&scope=&client_id=string&client_secret=string'
```
- request utl
```
http://localhost:8000/auth/login
```

#### 3. Melihat buku
- URL: `/books/{book_id}`
- Method: `GET`
- Auth Required?: ✅ Yes  
- Path Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| book_id | Integer | ID unik buku yang ingin dicari (Contoh: 1) |

- Request Body: `none`
- Response (200 OK):
```
{
  "book_id": 1,
  "category_id": 1,
  "genres": [
    {
      "genre_id": 5,
      "name": "Petualangan",
      "description": "Eksplorasi, aksi, dan petualangan seru"
    },
    {
      "genre_id": 6,
      "name": "Humor",
      "description": "Komedi dan cerita ringan menghibur"
    }
  ],
  "isbn": "978-602-03-3446-5",
  "title": "Laskar Pelangi",
  "author": "Andrea Hirata",
  "publisher": "Bentang Pustaka",
  "publication_year": 2005,
  "synopsis": "Novel tentang semangat anak-anak Belitung mengejar mimpi.",
  "total_stock": 5,
  "available_stock": 5
}
```

- curl
```
curl -X 'GET' \
  'http://localhost:8000/books/1' \
  -H 'accept: application/json'
```
- request url
```
http://localhost:8000/books/1
```


#### 4. Meminjam buku
- URL: `/transactions`
- Method: `POST`
- Auth Required?: ✅ Yes  
- Request Body:
```
{
  "user_id": 4,
  "book_id": 1
}
```
- Response (200 OK):
```
{
  "transaction_id": 1,
  "user_id": 4,
  "book_id": 1,
  "borrow_date": "2026-03-20T14:36:14.044829+08:00",
  "due_date": "2026-03-27T14:36:14.044829+08:00",
  "return_date": null,
  "status": "pending",
  "book": {
    "book_id": 1,
    "category_id": 1,
    "genres": [
      {
        "genre_id": 5,
        "name": "Petualangan",
        "description": "Eksplorasi, aksi, dan petualangan seru"
      },
      {
        "genre_id": 6,
        "name": "Humor",
        "description": "Komedi dan cerita ringan menghibur"
      }
    ],
    "isbn": "978-602-03-3446-5",
    "title": "Laskar Pelangi",
    "author": "Andrea Hirata",
    "publisher": "Bentang Pustaka",
    "publication_year": 2005,
    "synopsis": "Novel tentang semangat anak-anak Belitung mengejar mimpi.",
    "total_stock": 5,
    "available_stock": 5
  },
  "user": {
    "user_id": 4,
    "email": "khanza@student.itk.ac.id",
    "full_name": "Khanza Nabila Tsabita",
    "role": "member",
    "created_at": "2026-03-19T02:59:33.885993+08:00"
  }
}
```

- curl
```
curl -X 'POST' \
  'http://localhost:8000/transactions' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0IiwiZXhwIjoxNzczOTkwOTUyfQ.O6ZQeaqc4Swy38DhJonlVGmKP7xIg_Em5y9eMFdY4V4' \
  -H 'Content-Type: application/json' \
  -d '{
  "user_id": 4,
  "book_id": 1
}'
```
- request url
```
http://localhost:8000/transactions
```


#### 5. Membayar denda
- URL: ``
- Method: ``
- Auth Required?: ✅ Yes  
- Request Body:
```

```
- Response (200 OK):
```

```

### B. Admin 
#### 1. Membuat katagori buku
- URL: `/categories`
- Method: `POST`
- Auth Required?: ✅ Yes 
- Request Body:
```
{
  "name": "Fiksi-try",
  "description": "Buku-buku fiksi dan novel"
}
```
- Response (200 OK):
```
{
  "category_id": 7,
  "name": "Fiksi-try",
  "description": "Buku-buku fiksi dan novel"
}
```
- curl
```
curl -X 'POST' \
  'http://localhost:8000/categories' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzczOTk2MTMwfQ.cf9Xj_DUOqKmZbkF1H8I5ZHvX_UnRFD82oXO7Ce6lxk' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Fiksi-try",
  "description": "Buku-buku fiksi dan novel"
}'
```

- request url
```
http://localhost:8000/categories
```


#### 2. Membuat genre buku
- URL: `/genres`
- Method: `POST`
- Auth Required?: ✅ Yes  
- Request Body:
```
{
  "name": "Horor-try",
  "description": "Cerita yang menakutkan"
}
```
- Response (200 OK):
```
{
  "genre_id": 11,
  "name": "Horor-try",
  "description": "Cerita yang menakutkan"
}
```

- curl
```
  'http://localhost:8000/genres' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzczOTk2MTMwfQ.cf9Xj_DUOqKmZbkF1H8I5ZHvX_UnRFD82oXO7Ce6lxk' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Horor-try",
  "description": "Cerita yang menakutkan"
}'
```
- request url
```
http://localhost:8000/genres
```



#### 3. Menginput buku
- URL: `/books`
- Method: `POST`
- Auth Required?: ✅ Yes  
- Request Body:
```

```
- Response (200 OK):
```

```

#### 4. Konfirmasi peminjaman buku
- URL: ``
- Method: ``
- Auth Required?: ✅ Yes  
- Request Body:
```

```
- Response (200 OK):
```

```

#### 5. Menolak peminjaman
- URL: ``
- Method: ``
- Auth Required?: ✅ Yes  
- Request Body:
```

```
- Response (200 OK):
```

```

#### 6. Konfirmasi pelunasan denda
- URL: ``
- Method: ``
- Auth Required?: ✅ Yes  
- Request Body:
```

```
- Response (200 OK):
```

```