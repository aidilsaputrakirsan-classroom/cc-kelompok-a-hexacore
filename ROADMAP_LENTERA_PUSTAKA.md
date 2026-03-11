# 🏛️ Roadmap Pengembangan — LenteraPustaka
> **Cloud Computing — Kelompok A (HEXACORE) | SI ITK**  
> Dokumen ini adalah rencana pengembangan bertahap aplikasi LenteraPustaka, divalidasi terhadap modul dosen (Modul 1–15).

---

## 📋 Informasi Tim & Peran

| Nama | NIM | Peran | Fokus Modul |
|------|-----|-------|-------------|
| **Maulana Malik Ibrahim** | 10231051 | Lead Backend | 2, 4, 12–13 |
| Micka Mayulia Utama | 10231053 | Lead Frontend | 3, 4, 14 |
| Khanza Nabila Tsabita | 10231049 | Lead DevOps | 5–7, 9–11 |
| Muhammad Aqila Ardhi | 10231057 | Lead QA & Docs | 10, 14–15 |

---

## 🗺️ Peta Fase Semester

```
FASE 1: Foundation     → Minggu 1–4   → App berjalan lokal
FASE 2: Container      → Minggu 5–7   → Docker Compose up
FASE 3: UTS            → Minggu 8     → Demo + Viva
FASE 4: CI/CD          → Minggu 9–11  → Auto test + deploy
FASE 5: Architecture   → Minggu 12–14 → Microservices + Gateway
FASE 6: Final          → Minggu 15–16 → Production ready + UAS
```

---

## ✅ Status Legenda

| Simbol | Arti |
|--------|------|
| `[x]` | Selesai |
| `[/]` | Sedang dikerjakan |
| `[ ]` | Belum dikerjakan |
| `[-]` | Tidak berlaku / dilewati |

---

---

# 🟢 FASE 1: FOUNDATION (Minggu 1–4)
> Target: Full-stack app LenteraPustaka berjalan di lokal

---

## ✅ MINGGU 1 — Setup & Hello World
> **Modul 1** | Semua anggota

- [x] Environment terpasang (Python 3.10+, Node.js 18+, Git)
- [x] Tim terbentuk di GitHub Classroom
- [x] Repository ter-clone di semua laptop anggota
- [x] Struktur folder: `backend/`, `frontend/`, `docs/`
- [x] Backend Hello World FastAPI berjalan (`/health`, `/team`)
- [x] Frontend Hello World React berjalan, fetch ke backend
- [x] `.gitignore` sudah mencakup `.env`, `node_modules/`
- [x] File `docs/member-*.md` setiap anggota sudah ada dan ter-push

**Validasi Modul 1:** ✅ SELESAI — Sistem saat ini sudah melampaui persyaratan Modul 1.

---

## ✅ MINGGU 2 — REST API + Database (Template Generik)
> **Modul 2** | Lead Backend utama

- [x] PostgreSQL terkoneksi via SQLAlchemy
- [x] Arsitektur 5 file: `database.py`, `models.py`, `schemas.py`, `crud.py`, `main.py`
- [x] Model `Item` generik dengan CRUD lengkap
- [x] Endpoint `GET /items/stats` (tugas terstruktur) ✅
- [x] `.env` + `.env.example` tersedia
- [x] API terdokumentasi di Swagger UI

**Validasi Modul 2:** ✅ SELESAI — Template generik berjalan + tugas stats selesai.

---

## [ ] MINGGU 2 (Lanjutan) — Domain LenteraPustaka
> **Pengembangan domain app** | Lead Backend — BELUM DIKERJAKAN

> ⚠️ **Task ini bisa dikerjakan setelah konfirmasi dari kamu.**

### Tahap A — Models (database.py + models.py)
- [ ] Hapus model `Item` generik
- [ ] Buat model `User` (user_id UUID, email unique, password_hash, full_name, role, created_at)
- [ ] Buat model `Category` (category_id Integer, name, description)
- [ ] Buat model `Book` (book_id UUID, category_id FK, isbn unique, title, author, publisher, publication_year, total_stock, available_stock)
- [ ] Buat model `Transaction` (transaction_id UUID, user_id FK, book_id FK, borrow_date, due_date, return_date nullable, status)
- [ ] Buat model `Fine` (fine_id UUID, transaction_id FK unique, amount, is_paid)
- [ ] Tambah relasi SQLAlchemy (`relationship()`) antar model
- [ ] Verifikasi: 5 tabel terbuat di PostgreSQL (`\dt` di psql)

### Tahap B — Schemas (schemas.py)
- [ ] `UserCreate`, `UserResponse`
- [ ] `CategoryCreate`, `CategoryResponse`
- [ ] `BookCreate`, `BookUpdate`, `BookResponse`
- [ ] `TransactionCreate`, `TransactionUpdate`, `TransactionResponse`
- [ ] `FineResponse`
- [ ] `BookStatsResponse` (untuk `GET /books/stats`)
- [ ] Verifikasi: `python -c "import schemas; print('OK')"` tanpa error

### Tahap C — CRUD + Business Logic (crud.py)
- [ ] CRUD `Category`: `create_category`, `get_categories`, `get_category`, `update_category`, `delete_category`
- [ ] CRUD `Book`: `create_book`, `get_books` (+ search, pagination), `get_book`, `update_book`, `delete_book`
- [ ] Fungsi `get_book_stats()` — total buku, total stok, stok tersedia, sedang dipinjam, overdue
- [ ] CRUD `User`: `create_user` (dengan bcrypt hash), `get_users`, `get_user`
- [ ] **Business Logic Borrow**: `create_transaction()` — cek `available_stock > 0`, decrement stok, buat transaksi. Raise HTTP 400 jika stok habis
- [ ] **Business Logic Return**: `return_book()` — increment stok, update status ke `returned`, bandingkan `return_date` vs `due_date`, auto-buat `Fine` jika terlambat
- [ ] CRUD `Fine`: `get_fines`, `pay_fine`

### Tahap D — Endpoints (main.py)
- [ ] Update semua import
- [ ] Section CATEGORIES: `POST /categories`, `GET /categories`
- [ ] Section BOOKS: `POST /books`, `GET /books`, `GET /books/{book_id}`, `PUT /books/{book_id}`, `DELETE /books/{book_id}`, `GET /books/stats`
- [ ] Section USERS: `POST /users`, `GET /users`, `GET /users/{user_id}`
- [ ] Section TRANSACTIONS: `POST /transactions` (borrow), `GET /transactions`, `GET /transactions/{trx_id}`, `PUT /transactions/{trx_id}/return`
- [ ] Section FINES: `GET /fines`, `PUT /fines/{fine_id}/pay`
- [ ] Verifikasi: semua endpoint tampil di Swagger `http://localhost:8000/docs`

---

## [ ] MINGGU 3 — React Frontend
> **Modul 3** | Lead Frontend (kamu bantu debug response format)

> **Tanggung jawab Lead Backend di Minggu 3:**
- [ ] Pastikan backend berjalan selama workshop frontend
- [ ] Bantu debug jika ada perbedaan response format
- [ ] Tambah endpoint jika frontend membutuhkan data baru

---

## [ ] MINGGU 4 — Full-Stack Integration + JWT Auth
> **Modul 4** | Lead Backend utama

- [ ] Install dependencies auth: `python-jose[cryptography]`, `passlib[bcrypt]`
- [ ] Update `backend/requirements.txt`
- [ ] Buat `backend/auth.py` — JWT utility (hash, verify, create token, get_current_user)
- [ ] Update `backend/.env`: tambah `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `ALLOWED_ORIGINS`
- [ ] Update `backend/.env.example`
- [ ] Update `models.py` — pastikan `User.password_hash` ada
- [ ] Update `schemas.py` — tambah `UserCreate`, `UserResponse`, `LoginRequest`, `TokenResponse`
- [ ] Update `crud.py` — tambah `authenticate_user()`, integrasi bcrypt
- [ ] Update `main.py`:
  - [ ] CORS dari env var (bukan wildcard `*`)
  - [ ] `POST /auth/register` (public)
  - [ ] `POST /auth/login` (public, return JWT)
  - [ ] `GET /auth/me` (protected)
  - [ ] Tambah `Depends(get_current_user)` ke semua endpoint CRUD
- [ ] Test alur end-to-end: register → login → akses protected endpoint
- [ ] Verifikasi: endpoint tanpa token → 401 Unauthorized

**Catatan Modul 4:** File `auth.py` adalah file ke-6 yang diizinkan secara eksplisit oleh modul (bukan bagian dari 5 file inti Separation of Concerns).

---

---

# 🔵 FASE 2: CONTAINERIZATION (Minggu 5–7)
> Target: `docker compose up -d` → semua berjalan

---

## [ ] MINGGU 5 — Docker Fundamentals (Backend Container)
> **Modul 5** | Lead DevOps utama | Lead Backend: review Dockerfile

- [ ] Buat `backend/.dockerignore`
- [ ] Buat `backend/Dockerfile` — Python 3.12-slim, layer-optimized
- [ ] Tambahkan healthcheck di Dockerfile: `HEALTHCHECK CMD curl -f http://localhost:8000/health`
- [ ] Build image: `docker build -t lentera-pustaka-backend:v1 .`
- [ ] Update `backend/.env` untuk Docker: `DATABASE_URL=...@host.docker.internal:5432/...`
- [ ] Test: `docker run -p 8000:8000 --env-file .env backend:v1` → Swagger muncul
- [ ] Push image ke Docker Hub: `docker push USERNAME/lentera-pustaka-backend:v1`
- [ ] **Tugas Lead Backend**: verifikasi semua endpoint berfungsi di dalam container

---

## [ ] MINGGU 6 — Docker Lanjutan (Multi-Stage + Networks)
> **Modul 6** | Lead Frontend + Lead DevOps | Lead Backend: fix database URL

- [ ] Buat Docker network: `docker network create cloudnet`
- [ ] Jalankan PostgreSQL di container (dengan volume `pgdata`)
- [ ] Update `backend/.env.docker`: `DATABASE_URL=postgresql://...@db:5432/...`
- [ ] Build backend image v2, jalankan di network `cloudnet`
- [ ] Verifikasi: backend → `db` container via Docker DNS
- [ ] Buat `frontend/nginx.conf`
- [ ] Buat `frontend/Dockerfile` — multi-stage (node builder + nginx production)
- [ ] Verifikasi: frontend image < 50 MB
- [ ] Jalankan 3 container: `frontend`, `backend`, `db` di network yang sama

---

## [ ] MINGGU 7 — Docker Compose
> **Modul 7** | Lead DevOps utama | Lead Backend: pastikan backend jalan di Compose

- [ ] Buat `docker-compose.yml` di root project (3 services: `db`, `backend`, `frontend`)
- [ ] Konfigurasi healthcheck `db` — `pg_isready`
- [ ] Konfigurasi `depends_on.db.condition: service_healthy` untuk backend
- [ ] Konfigurasi `restart: unless-stopped` semua service
- [ ] Konfigurasi named volume `pgdata` + network `cloudnet`
- [ ] Test: `docker compose up --build -d` → semua `Up (healthy)`
- [ ] Test persistence: `docker compose down` → `docker compose up -d` → data tetap ada
- [ ] Test auto-restart: kill process → container restart otomatis
- [ ] Buat `Makefile` — shortcut `make up`, `make down`, `make logs`, `make build`
- [ ] **Lolos checklist kesiapan UTS** (semua CRUD + auth berjalan di Compose)

---

---

# 🟡 FASE 3: UTS — Milestone 1 (Minggu 8)
> Demo + Viva | Semua anggota wajib siap

---

## [ ] MINGGU 8 — UTS Demo & Viva

### Persiapan Lead Backend:
- [ ] Semua endpoint LenteraPustaka berjalan di Compose (buku, user, transaksi, denda)
- [ ] Business logic borrow/return berfungsi dengan benar
- [ ] Hapus TODO comment, rapikan kode
- [ ] Siap menjelaskan: arsitektur 5 file, SQLAlchemy model, JWT auth, business logic

### Skenario Demo yang Harus Bisa:
- [ ] `docker compose up -d` — semua service naik
- [ ] Register user baru via frontend
- [ ] Login, dapat JWT token
- [ ] Tambah kategori + tambah buku
- [ ] Pinjam buku (transaksi terbuat, stok berkurang)
- [ ] Kembalikan buku (stok bertambah, denda jika terlambat)
- [ ] `docker compose down` + `up` → data tetap ada

---

---

# 🟣 FASE 4: CI/CD (Minggu 9–11)
> Target: Auto test + auto deploy ke cloud

---

## [ ] MINGGU 9 — Git Workflow & GitHub Actions Dasar
> Lead DevOps + Lead CI/CD

- [ ] Setup branch strategy: `main` (production), `develop` (dev), `feature/*`
- [ ] Buat `.github/workflows/test.yml` — auto run test saat push
- [ ] Pastikan backend punya minimal test sederhana (bisa gunakan pytest)

## [ ] MINGGU 10 — CI Pipeline + Testing
> Lead QA & Docs + Lead DevOps

- [ ] Tulis basic test untuk endpoint kritis: `GET /health`, `POST /auth/login`
- [ ] Integrasi test di CI pipeline (GitHub Actions)
- [ ] Setup environment variable di GitHub Secrets

## [ ] MINGGU 11 — CD Pipeline (Auto Deploy ke Cloud)
> Lead DevOps

- [ ] Setup deployment ke Railway/Render
- [ ] Auto deploy saat merge ke `main`
- [ ] Verifikasi: push ke main → auto build → auto deploy → app live di cloud

---

---

# 🟠 FASE 5: ARCHITECTURE (Minggu 12–14)
> Target: Microservices + API Gateway

---

## [ ] MINGGU 12–13 — Microservices (Lead Backend Fokus)
> **Modul 12–13** | Lead Backend utama

- [ ] Pecah backend LenteraPustaka menjadi minimal 2 microservice:
  - `user-service` — auth, register, login, profil user
  - `library-service` — buku, kategori, transaksi, denda
- [ ] Setiap service punya `main.py`, `models.py`, `schemas.py`, `crud.py`, `database.py` sendiri
- [ ] Buat `Dockerfile` per service
- [ ] Update `docker-compose.yml` untuk multi-service

## [ ] MINGGU 13 — API Gateway (Nginx)
> Lead DevOps

- [ ] Setup Nginx sebagai reverse proxy
- [ ] Routing: `/api/users/*` → user-service, `/api/library/*` → library-service

## [ ] MINGGU 14 — Frontend Integration + Monitoring
> Lead Frontend

- [ ] Update frontend untuk akses via API Gateway
- [ ] Tambah monitoring/logging dasar

---

---

# 🟡 FASE 6: FINAL (Minggu 15–16)
> Target: Production-ready + UAS

---

## [ ] MINGGU 15 — Polish, Security & Docs
> Semua anggota

- [ ] Review keamanan: CORS production, tidak ada secret di kode
- [ ] Rate limiting, input sanitization
- [ ] README.md final dan lengkap
- [ ] Update `docs/` dokumentasi API

## [ ] MINGGU 16 — UAS Demo
> Semua anggota siap

- [ ] Full demo: dari `docker compose up` sampai semua fitur LenteraPustaka berjalan
- [ ] Microservices + Gateway berjalan
- [ ] CI/CD pipeline aktif
- [ ] Setiap anggota siap viva tentang area masing-masing

---

---

## 📌 Validasi Rencana Terhadap Modul Dosen

| Modul | Ketentuan Dosen | Status Rencana |
|-------|-----------------|----------------|
| 1 | Setup env + Hello World FastAPI + React | ✅ Sudah selesai |
| 2 | REST API CRUD + PostgreSQL + 5-file architecture + `/items/stats` | ✅ Sudah selesai |
| 3 | React frontend CRUD + fetch API | [ ] Minggu 3 |
| 4 | JWT auth + CORS fix + env vars | [ ] Minggu 4 |
| 5 | Dockerfile backend + push Docker Hub | [ ] Minggu 5 |
| 6 | Multi-stage frontend Dockerfile + Docker network + volume | [ ] Minggu 6 |
| 7 | `docker-compose.yml` lengkap + healthcheck + `docker compose up` | [ ] Minggu 7 |
| 8 | UTS demo: full-stack + Docker | [ ] Minggu 8 |
| 9–11 | GitHub Actions CI/CD + cloud deployment | [ ] Minggu 9–11 |
| 12–14 | Microservices + API Gateway (Nginx) | [ ] Minggu 12–14 |
| 15–16 | Final polish + UAS | [ ] Minggu 15–16 |

---

## ⚠️ Catatan Penting untuk Lead Backend

1. **Arsitektur 5 file** wajib dijaga sampai Fase Microservices: `database.py`, `models.py`, `schemas.py`, `crud.py`, `main.py`
2. **Business logic** (borrow/return/fine) HARUS di `crud.py`, bukan di `main.py`
3. **Domain LenteraPustaka** (5 tabel: users, categories, books, transactions, fines) belum diimplementasikan — ini pekerjaan berikutnya setelah kamu konfirmasi
4. **`auth.py`** (file ke-6) diizinkan oleh modul untuk JWT utilities
5. **Setiap anggota wajib punya commit** di semua area untuk penilaian dosen
