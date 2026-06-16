# ☁️ Cloud App - [LenteraPustaka]

![CI Pipeline](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-hexacore/actions/workflows/ci.yml/badge.svg)

Aplikasi **LenteraPustaka** adalah sebuah platform berbasis web yang dirancang untuk mendigitalisasi proses pengelolaan katalog dan transaksi peminjaman buku di perpustakaan. Aplikasi ini bertujuan untuk memberikan kemudahan akses informasi bagi pengunjung perpustakaan, memfasilitasi sirkulasi peminjaman, sekaligus menyederhanakan tugas administratif pustakawan secara terpusat.

Sistem ini dirancang untuk tiga kelompok demografi pengguna dengan kebutuhan yang berbeda:
1. **Pengunjung Publik (Guest):**
mahasiswa, pelajar, atau masyarakat umum yang ingin menelusuri katalog atau cek ketersediaan buku sebelum memutuskan untuk mendaftar
2. **Anggota Terdaftar (Member):**
pengguna aktif perpustakaan yang membutuhkan fasilitas untuk meminjam buku, mengecek batas waktu pengembalian, dan melihat riwayat.
3. **Pustakawan (Admin):**
Petugas perpustakaan yang membutuhkan alat bantu efisien berupa dashboard statistik terstruktur dan mengelola inventaris, menyetujui peminjaman, dan mengelola member.

Aplikasi ini dikembangkan untuk memberikan solusi atas beberapa kendala dalam pengelolaan perpustakaan:
1. **Pencarian yang inefisien:**
Menyelesaikan masalah pengunjung yang kesulitan menemukan buku di rak fisik dengan menyediakan fitur *searchbar* digital yang cepat dan akurat.
2. **Risiko Kehilangan Data Transaksi:**
Menggantikan pencatatan peminjaman dengan menjadi basis data digital yang terstruktur.
3. **Keterbatasan Akses Informasi:**
Mengatasi masalah pengunjung yang harus datang langsung hanya untuk mengecek apakah sebuah buku sedang dipinjam orang lain atau tersedia dengan menampilkan ketersediaan stok secara real-time

## 👥 Tim

| Nama | NIM | Peran | Kontribusi Utama |
|------|-----|-------|------------------|
| Maulana Malik Ibrahim | 10231051 | Lead Backend | Merancang Auth & Library Service, integrasi database, dan validasi Pydantic. |
| Micka Mayulia Utama | 10231053 | Lead Frontend | Membangun UI React, integrasi Axios, dan halaman Status Dashboard. |
| Khanza Nabila Tsabita | 10231049 | Lead DevOps | Menulis Dockerfile, konfigurasi Nginx Gateway, CI/CD Actions, dan Railway deploy. |
| Muhammad Aqila Ardhi | 10231057 | Lead QA & Docs | Membuat unit/integration tests (Pytest), pengujian Swagger, dan menyusun dokumentasi. |

## 🌐 Live Demo

| Layanan (Service) | Deskripsi | Tautan (URL) |
| :--- | :--- | :--- |
| **Frontend Web** | Antarmuka pengguna (React/Vite) | [Buka Aplikasi](https://frontend-production-78efa.up.railway.app/) |
| **Auth Service** | API Autentikasi & Swagger UI | [Buka Auth API Docs](https://auth-services-production-4163.up.railway.app/docs) |
| **Library Service**| API Manajemen Buku & Swagger UI| [Buka Library API Docs](https://library-service-production-6b14.up.railway.app/docs) |

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| FastAPI | Backend REST API Microservices |
| React | Frontend SPA |
| PostgreSQL | Database Server (1 Instance dengan 2 DB terisolasi: `auth_db` & `item_db`) |
| Docker | Containerization |
| Nginx | API Gateway (Local Development) & Web Server Frontend (Production) |
| GitHub Actions | CI/CD |
| Railway/Render | Cloud Deployment |
| Custom Metrics | Observability & Logging |

## 🏗️ Architecture

```mermaid
flowchart TD
    USER["👤 User"] --> GW["🚪 API Gateway<br/>Nginx :80"]
    GW -->|"/auth/*, /users/*"| AUTH["🔐 Auth Service<br/>FastAPI :8001"]
    GW -->|"/items/*, /categories, /transactions"| ITEM["📦 Library Service<br/>FastAPI :8002"]
    GW -->|"/"| FE["⚛️ Frontend<br/>React :3000"]
    
    subgraph RailwayDB ["🗄️ Railway PostgreSQL Server (1 Instance)"]
        ADB[("auth_db<br/>(Isolated DB)")]
        IDB[("item_db<br/>(Isolated DB)")]
    end

    AUTH --> ADB[("auth_db<br/>PostgreSQL :5433")]
    ITEM --> IDB[("item_db<br/>PostgreSQL :5434")]
    ITEM -.->|"HTTP /verify"| AUTH
```

## 🚀 Project Journey (Evolusi Sistem)

Proyek ini berevolusi melalui 3 fase utama:
1. **Monolith (Milestone 1):** Backend FastAPI tunggal dan UI React yang terhubung ke satu PostgreSQL.
2. **Containerization & CI/CD (Milestone 2):** Aplikasi dibungkus Docker Compose, dengan *pipeline* otomatisasi GitHub Actions untuk *testing* dan *deploy* ke Railway.
3. 3. **Microservices & Security (Milestone 3):** Sistem dipecah menjadi dua layanan independen (`Auth` dan `Library`). Pada *local environment*, sistem dirutekan melalui Nginx API Gateway. Sedangkan pada *production* (Railway), Nginx bertindak sebagai penyaji web statis, dan Frontend langsung menembak URL masing-masing layanan secara terisolasi via *Environment Variables*.

## ☁️ Deployment (Railway)

Aplikasi ini di-*deploy* menggunakan CI/CD ke platform Railway:
1. Kredensial rahasia (`.env`) disimpan secara aman di menu Variables Railway.
2. GitHub Actions (`ci.yml`) akan menjalankan *Integration Test* setiap ada *commit* atau *Merge Request* ke *branch* utama.
3. Jika *test* lolos (*Passed*), GitHub akan men-*trigger* *webhook* Railway untuk *build image* terbaru dan me-*restart* aplikasi di *cloud* tanpa hambatan (*zero-downtime deployment*).

## 🤖 Getting Started

Kami merekomendasikan penggunaan **Docker Compose** agar seluruh sistem dapat berjalan serentak secara otomatis. Namun, kami juga menyediakan panduan *Quick Start* (Native) untuk kebutuhan *development* atau pengujian manual per modul.

Kami telah menyediakan panduan langkah-demi-langkah yang lengkap untuk menjalankan proyek ini di berbagai perangkat.

### 🐳 Panduan Menjalankan Project (Docker Compose)

Proyek ini sudah terkonfigurasi penuh menggunakan Docker Compose untuk memudahkan proses deployment lokal.

#### 1. Clone & Siapkan Environment
Buka terminal dan jalankan perintah berikut untuk mengunduh repositori dan menyiapkan kredensial:
```bash
git clone [https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-hexacore.git](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-hexacore.git)
cd cc-kelompok-a-hexacore
cp .env.example .env
# Wajib: Edit file .env dengan kredensial/password lokal Anda
```

#### 2. Jalankan Seluruh Sistem  
Buka terminal di root folder proyek dan jalankan perintah:
```bash
docker compose up -d --build
```
(Perintah ini akan secara otomatis membuat network lentera_net, menyiapkan volume lentera_data, dan menyalakan Database, Backend, serta Frontend secara bersamaan).

#### 3. Cek Status Aplikasi
Pastikan ketiga services sudah berstatus Up (healthy):

```bash
docker compose ps
```

#### 4. Akses Aplikasi
- **Frontend (UI):** http://localhost:3000
- **API Docs - Auth Service (Swagger):** http://localhost:8001/docs
- **API Docs - Library Service (Swagger):** http://localhost:8002/docs

#### 5. Mematikan Sistem
Untuk mematikan sistem tanpa menghilangkan data database:

```bash
docker compose down
```

### Quick Start Instalasi Native (Untuk Development)  
Prasyarat
- Python 3.10+
- Node.js 18+
- Git

Automated Setup: `./setup.sh`

**1. Auth Service (Backend)**
```bash
cd services/auth-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

**2. Library Service (Backend)**
```bash
cd services/library-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

**3. Frontend**
```bash
cd frontend
npm install
npm install recharts
npm run dev
```

Access
- Auth API Docs: http://localhost:8001/docs
- Library API Docs: http://localhost:8002/docs
- Frontend UI: http://localhost:3000

### 🛠 DevOps Automation
Gunakan perintah berikut untuk mempermudah workflow:
- `make lint`: Menjalankan pengecekan kualitas kode.
- `make test`: Menjalankan unit testing.
- `make pr-check`: Simulasi pengecekan sebelum melakukan Pull Request.

## 📅 Roadmap

| Minggu | Target | Status |
|--------|--------|--------|
| 1 | Setup & Hello World | ✅ |
| 2 | REST API + Database | ✅ |
| 3 | React Frontend | ✅ |
| 4 | Full-Stack Integration | ✅ |
| 5-7 | Docker & Compose | ✅ |
| 8 | UTS Demo | ✅ |
| 9-11 | CI/CD Pipeline | ✅ |
| 12-14 | Microservices | ✅ |
| 15-16 | Final & UAS | ⬜ |

## 🗃️ Project Structure

```text
CC-KELOMPOK-A-HEXACORE/
├── backend/                 # (Legacy) Kode sumber arsitektur Monolith lama
├── docs/                    # Dokumentasi teknis, arsitektur, dan panduan tim
│   └── test/                # Direktori bukti pengujian (Screenshot Swagger & UI)
├── frontend/                # Layanan Antarmuka Pengguna (React SPA + Vite)
│   ├── public/              # Aset statis publik
│   └── src/                 # Kode sumber komponen UI dan integrasi Axios
├── scripts/                 # Kumpulan skrip utilitas (Bash & PowerShell)
├── services/                # [Core] Arsitektur Microservices Utama
│   ├── auth-service/        # Layanan Autentikasi, Profil, dan JWT (FastAPI)
│   ├── gateway/             # API Gateway & Rate Limiting (Nginx)
│   ├── library-service/     # Layanan Katalog Buku, Transaksi, & Denda (FastAPI)
│   └── shared/              # Modul utilitas bersama (Log & Metrik)
├── tests/                   # Suite Pengujian Otomatis QA
│   └── integration/         # Skenario pengujian lintas-layanan (Cross-Service)
├── docker-compose.yml       # Orkestrasi kontainer untuk environment lokal
├── docker-compose.prod.yml  # Orkestrasi kontainer untuk environment produksi
├── Makefile                 # Kumpulan perintah otomatisasi workflow
├── setup.sh                 # Skrip setup instalasi environment lokal (Native)
└── readme.md                # Dokumentasi utama repositori
```

## 📁 Tabel ERD
```text
+-------------------+              +-----------------------+
|       USERS       |              |      TRANSACTIONS     |
+-------------------+              +-----------------------+
| user_id (PK)      | 1          N | transaction_id (PK)   |
| email (UK)        |--------------| user_id (FK)          |
| password_hash     | (Melakukan)  | book_id (FK)          |
| full_name         |              | borrow_date           |
| role              |              | due_date              |
| created_at        |              | return_date           |
+-------------------+              | status                |
                                   +-----------+-----------+
                                         | 1         | N
                                         |           |
+-------------------+     (Menghasilkan) |           | 
|    CATEGORIES     |                    |           |
+-------------------+                    | 1         |
| category_id (PK)  |              +-------------+   |
| name (UK)         |              |   FINES     |   |
| description       |              +-----------  +   |
+---------+---------+              | fine_id(PK) |   |
          |                        | trans_id(FK)|   |
          | 1                      | amount      |   |
          | (Memiliki)             | status      |   |
          |                        | proof_url   |   |
          | N                      | rej_note    |   |
+---------+---------+              +-----------+     |
|       BOOKS       | 1                              |
+-------------------+--------------------------------+
| book_id (PK)      |
| category_id (FK)  |
| isbn (UK)         |
| title             |
| author            |
| publisher         | 
| publication_year  | 1     N +-----------------+ N     1 +------------------+
| synopsis          |---------|   BOOK_GENRES   |---------|      GENRES      |
| total_stock       |         +-----------------+         +------------------+
| available_stock   |         | book_id (PK,FK) |         | genre_id (PK)    |
| cover_image_url   |         | genre_id(PK,FK) |         | name (UK)        |
+-------------------+         +-----------------+         | description      |
                                                          +------------------+                    
```
Berikut adalah detail arsitektur *database* PostgreSQL yang digunakan oleh aplikasi LenteraPustaka.
* [Schema Database](docs/SchemaDatabase.md)

---

## 📡 API Documentation & Endpoints

Pada tahap *local development*, seluruh akses API dirutekan secara terpusat melalui Nginx API Gateway. Namun pada *production* (Railway), setiap layanan berdiri independen dan Frontend langsung berkomunikasi dengan *endpoint* spesifik mereka. Aplikasi ini menggunakan JSON Web Token (JWT) Bearer untuk autentikasi pada *endpoint* yang dilindungi.

### 1. Auth & User Service
Layanan ini menangani pendaftaran, autentikasi, dan manajemen profil pengguna.

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/login` | ❌ | Autentikasi kredensial dan mendapatkan token JWT. |
| `POST` | `/auth/register` | ❌ | Mendaftarkan akun pengguna baru. |
| `GET` | `/auth/me` | ✅ | Mengambil data profil milik pengguna yang sedang *login*. |
| `PUT` | `/auth/me/profile` | ✅ | Memperbarui data profil pengguna saat ini. |
| `PUT` | `/auth/me/change-password` | ✅ | Memperbarui kata sandi pengguna saat ini. |
| `GET`, `POST` | `/users` | ✅ | (Admin) Mengelola daftar seluruh pengguna. |
| `GET`, `PUT`, `DELETE`| `/users/{user_id}` | ✅ | (Admin) Mengelola data pengguna spesifik. |
| `PUT` | `/users/{user_id}/reset-password` | ✅ | (Admin) Melakukan reset paksa kata sandi pengguna. |
| `GET` | `/verify` | ✅ | Verifikasi validitas token (digunakan internal antar-layanan). |
| `GET` | `/team` | ❌ | Menampilkan informasi tim pengembang. |
| `GET` | `/auth/health`, `/auth/metrics` | ❌ | Pengecekan status operasional dan metrik performa layanan. |

### 2. Library Service (Katalog & Sirkulasi)
Layanan ini menangani inventaris buku, kategori, transaksi peminjaman, dan sistem denda.

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :---: | :--- |
| `GET` | `/items/public` | ❌ | Mengambil daftar buku untuk pengunjung tanpa akun (*guest*). |
| `GET`, `POST` | `/books` | ✅ | Mengambil seluruh katalog atau menambahkan buku baru. |
| `GET`, `PUT`, `DELETE`| `/books/{book_id}` | ✅ | Melihat, mengubah, atau menghapus spesifik buku. |
| `GET`, `POST` | `/categories` & `/genres` | ✅ | Mengelola data klasifikasi kategori dan genre buku. |
| `GET`, `POST` | `/transactions` | ✅ | Melihat riwayat peminjaman atau mengajukan pinjaman baru. |
| `PUT` | `/transactions/{id}/approve` | ✅ | (Admin) Menyetujui pengajuan peminjaman buku. |
| `PUT` | `/transactions/{id}/reject` | ✅ | (Admin) Menolak pengajuan peminjaman buku. |
| `PUT` | `/transactions/{id}/return` | ✅ | (Admin) Mencatat pengembalian buku dari pengguna. |
| `PUT` | `/transactions/{id}/lost` | ✅ | (Admin) Menandai buku yang hilang dalam masa peminjaman. |
| `PUT` | `/transactions/{id}/simulate-overdue` | ✅ | (Dev/Admin) Mensimulasikan keterlambatan batas waktu. |
| `GET` | `/fines` | ✅ | Melihat daftar denda pengguna. |
| `PUT` | `/fines/{fine_id}/submit-payment` | ✅ | (Member) Mengunggah bukti pembayaran denda. |
| `PUT` | `/fines/{fine_id}/approve` | ✅ | (Admin) Memverifikasi dan menyetujui pelunasan denda. |
| `POST` | `/upload/covers` & `/upload/fines` | ✅ | *Endpoint* untuk mengunggah berkas gambar/dokumen. |
| `GET` | `/books/stats`, `/items/stats`, `/fines/stats`| ✅ | Mengambil agregasi data statistik untuk *dashboard* Admin. |
| `GET` | `/items/health`, `/items/metrics` | ❌ | Pengecekan status operasional dan metrik performa layanan. |

---

### 🔍 Panduan Pengecekan & Pengujian API

Untuk memvalidasi dan menguji seluruh *endpoint* di atas, Anda dapat menggunakan antarmuka grafis yang ter- *generate* secara otomatis atau menggunakan terminal:

**1. Melalui Antarmuka Swagger UI (Direkomendasikan)**
FastAPI menyediakan dokumentasi interaktif yang memungkinkan Anda mengeksekusi *request* langsung dari *browser*.
1. Pastikan seluruh layanan berjalan (via Docker Compose).
2. Akses antarmuka Auth Service: `http://localhost:8001/docs` (Atau via gateway jika diatur).
3. Akses antarmuka Library Service: `http://localhost:8002/docs`.
4. Klik tombol **"Authorize"** di pojok kanan atas dan masukkan token Anda untuk mengakses *endpoint* yang terkunci (✅).
5. Pilih *endpoint* yang diinginkan, klik **"Try it out"**, isi parameter/ *body*, dan klik **"Execute"**.

**2. Melalui Terminal (cURL)**
Untuk pengecekan cepat tanpa *browser*:
```bash
# Contoh 1: Pengecekan Metrik Publik
curl -s http://localhost/auth/metrics

# Contoh 2: Menembak Endpoint Terlindungi (Membutuhkan Header Otorisasi)
curl -X GET http://localhost/items/stats \
  -H "Authorization: Bearer MASUKKAN_TOKEN_JWT_ANDA_DISINI"
```

  
## 📚 Dokumentasi Teknis & Laporan Pengujian
**⚙️ Modul 2: Backend REST API (FastAPI)**
* [Hasil Pengujian API Terintegrasi via Swagger](docs/api-test-results.md)
* [Ringkasan Spesifikasi & Parameter API](docs/api-summary.md)

**💻 Modul 3: Frontend Development (React UI)**
* [Hasil Pengujian Fungsionalitas Antarmuka (UI)](docs/ui-test-results.md)

**🔐 Modul 4: Integrasi Full-Stack & Autentikasi**
* [Hasil Pengujian End-to-End (Alur Otentikasi & Otorisasi)](docs/auth-test-results.md)
* [Panduan Instalasi & Konfigurasi Environment Lokal](docs/setup-guide.md)
* [Dokumentasi Lengkap Endpoints API](docs/api-documentation.md)

**📦 Modul 5 & 6: Docker Containerization & Orchestration**
* 🐳 **[Diagram Arsitektur Multi-Kontainer Docker](docs/docker-architecture.md)**
* [Analisis & Perbandingan Ukuran Base Image Docker](docs/image-comparison.md)
* [Cheat Sheet: Daftar Perintah Esensial Docker](docs/docker-cheatsheet.md)

**🎯 Persiapan UAS & Arsitektur Utama**
* 🚀 [Naskah Demo UAS Kelompok Hexacore](docs/uas-demo-script.md)
* ✅ [Final Readiness Checklist UAS](docs/final-checklist.md)
* 🗄️ [Detail Skema Database & ERD Terkini](docs/SchemaDatabase.md)

