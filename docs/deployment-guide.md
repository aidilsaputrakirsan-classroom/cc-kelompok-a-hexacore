# Deployment Guide (Railway)

## 🏗️ 1. Railway Setup (Microservices Architecture)
1. Login ke Railway via GitHub.
2. Buat *Project* baru.
3. Tambahkan **2 layanan PostgreSQL** terpisah:
   - PostgreSQL 1 (Ganti nama menjadi `auth_db`)
   - PostgreSQL 2 (Ganti nama menjadi `item_db`)
4. Deploy **Auth Service** (Arahkan *Root Directory* ke `/services/auth-service`).
5. Deploy **Library Service** (Arahkan *Root Directory* ke `/services/library-service`).
6. Deploy **Frontend** (Arahkan *Root Directory* ke `/frontend`).
*(Catatan: Nginx API Gateway hanya digunakan untuk environment lokal, di Railway Frontend berkomunikasi langsung ke masing-masing service).*

---

## 🔐 2. Environment Variables

### A. Auth Service (Railway)
| Variable | Contoh Value | Keterangan |
|----------|-------------|------------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Sambungkan ke `auth_db` |
| `SECRET_KEY` | `8f7a...` *(random hex)* | Kunci rahasia untuk enkripsi JWT |
| `CORS_ORIGINS` | `https://frontend-production-78efa.up.railway.app` | URL Frontend tanpa `/` di akhir |
| `ENVIRONMENT` | `production` | Mode peladen |
| `PORT` | `8001` | Port aplikasi internal sesuai arsitektur |

### B. Library / Item Service (Railway)
| Variable | Contoh Value | Keterangan |
|----------|-------------|------------|
| `DATABASE_URL` | `${{Postgres-1.DATABASE_URL}}` | Sambungkan ke `item_db` |
| `AUTH_SERVICE_URL`| `https://auth-services-production-4163.up.railway.app` | URL Auth Service publik/internal untuk verifikasi JWT |
| `CORS_ORIGINS` | `https://frontend-production-78efa.up.railway.app` | URL Frontend tanpa `/` di akhir |
| `PORT` | `8002` | Port aplikasi internal sesuai arsitektur |

### C. Frontend (React / Vite)
*(Karena tidak menggunakan Gateway di Railway, pisahkan URL API untuk masing-masing layanan)*

| Variable | Contoh Value | Keterangan |
|----------|-------------|------------|
| `VITE_AUTH_API_URL` | `https://auth-services-production-4163.up.railway.app` | Arahkan ke URL spesifik Auth Service |
| `VITE_LIBRARY_API_URL` | `https://library-service-production-6b14.up.railway.app` | Arahkan ke URL spesifik Library Service |
| `PORT` | `80` | Sesuai konfigurasi Docker/Vite |

---

## 🤖 3. GitHub Secrets (Untuk CI/CD Workflow)
Simpan konfigurasi ini di menu **Settings > Secrets and variables > Actions** di repositori GitHub:

| Secret | Keterangan |
|--------|-----------|
| `RAILWAY_TOKEN` | Token sakti dari `railway.app/account/tokens` untuk memicu *auto-deploy* dari CI/CD pipeline. |

---

## 🛠️ 4. Troubleshooting (Masalah Umum)

* **CORS Error di Browser:** Pastikan variabel `CORS_ORIGINS` di semua *backend services* sudah diisi tepat sama persis dengan URL *frontend* yang aktif, yaitu `https://frontend-production-78efa.up.railway.app` (jangan tambahkan *slash* `/` di akhir URL).
* **Aplikasi Blank / 502 Bad Gateway:** Periksa tab "Deploy Logs" di *dashboard* Railway. Pastikan tidak ada kegagalan *build* pada Dockerfile.
* **Fitur Pinjam Buku Macet (Timeout):** Ini biasanya indikasi *Cascading Failure*. Pastikan `AUTH_SERVICE_URL` yang ada di dalam *Environment Variables* Library Service sudah diisi URL Auth Service yang valid agar Library Service bisa memverifikasi token JWT.
* **Gagal Login / Token Error:** Pastikan `SECRET_KEY` sudah terisi dengan *string* yang sama.