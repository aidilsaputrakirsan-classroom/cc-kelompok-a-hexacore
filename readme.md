# ☁️ Cloud App - [LenteraPustaka]

Aplikasi **LenteraPustaka** adalah sebuah platform berbasis web yang dirancang untuk mendigitalisasi proses pengelolaan katalog dan transaksi peminjaman buku di perpustakaan. Aplikasi ini bertujuan untuk memberikan kemudahan akses informasi bagi pengunjung perpustakaan, memfasilitasi sirkulasi peminjaman, sekaligus menyederhanakan tugas administratif pustakawan secara terpusat.

Sistem ini dirancang untuk tiga kelompok demografi pengguna dengan kebutuhan yang berbeda:
1. **Pengunjung Publik (Guest):**
mahasiswa, pelajar, atau masyarakat umum yang ingin menelusuri katalog atau cek ketersediaan buku sebelum memutuskan untuk mendaftar
2. **Anggota Terdaftar (Member):**
pengguna aktif perpustakaan yang membtuuhkan fasilitas untuk meminjam buku, mengecek batas waktu pengembalian, dan melihat riwayat.
3. **Pustakawan (Admin):**
Petugas perpustakaan yang membutuhkan alat bantu efisien berupa dashboard statistik terstruktur dan mengelola inventaris, menyetujui peminjaman, dan mengelola member.

Aplikasi ini dikembangkan untuk memberikan solusi atas beberapa kendala dalam pengelolaan perpustakaan:
1. **Pencarian yang inefisien:**
Menyelesaikan masalah pengunjung yang kesulitan menemukan buku di rak fisik dengan menyediakan fitur *searchbar* digital yang cepat dan akurat.
2. **Risiko Kehilagan Data Transaksi:**
Menggantikan pencatatan peminjaman dengan menjadi basis data digital yang terstruktur.
3. **Keterbatasan Akses Informasi:**
Mengatasi masalah pengunjung yang harus datang langsung hanya untuk mengecek apakah sebuah buku sedang dipinjam orang lain atau tersedia dengan menampilkan ketersediaan stok secara real-time

## 👥 Tim

| Nama | NIM | Peran |
|------|-----|-------|
| Maulana Malik Ibrahim | 10231051 | Lead Backend |
| Micka Mayulia Utama | 10231053 | Lead Frontend |
| Khanza Nabila Tsabita | 10231049 | Lead DevOps |
| Muhammad Aqila Ardhi | 10231057 | Lead QA & Docs |

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| FastAPI   | Backend REST API |
| React     | Frontend SPA |
| PostgreSQL | Database |
| Docker    | Containerization |
| GitHub Actions | CI/CD |
| Railway/Render | Cloud Deployment |

## 🏗️ Architecture

```text
[React Frontend] <--HTTP--> [FastAPI Backend] <--SQL--> [PostgreSQL]
       |                            |
  Vite + JSX               REST API Endpoints
  (Port 5173)               (Port 8000)
```

## 🤖 Getting Started
Prasyarat
- Python 3.10+
- Node.js 18+
- Git

Kami telah menyediakan panduan langkah-demi-langkah yang lengkap untuk menjalankan proyek ini di berbagai perangkat.

👉 BACA DI SINI: [Panduan Instalasi & Setup Lengkap](docs/setup-guide.md)

#### Quick Start :
- Automated Setup: `./setup.sh`
- Backend
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Frontend
```
cd frontend
npm install
npm install recharts
npm run dev
```

Access
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

## 📅 Roadmap

| Minggu | Target | Status |
|--------|--------|--------|
| 1 | Setup & Hello World | ✅ |
| 2 | REST API + Database | ✅ |
| 3 | React Frontend | ✅ |
| 4 | Full-Stack Integration | ✅ |
| 5-7 | Docker & Compose | ✅ |
| 8 | UTS Demo | ⬜ |
| 9-11 | CI/CD Pipeline | ⬜ |
| 12-14 | Microservices | ⬜ |
| 15-16 | Final & UAS | ⬜ |

## 🗃️ Project Structure

```
CC-KELOMPOK-A-HEXACORE/
├── backend/
│   ├── static/   
│   ├── Dockerfile           ← BARU
│   ├── .dockerignore        ← BARU           
│   ├── crud.py              ← Updated (Fix Lost Buku Status)
│   ├── database.py
│   ├── main.py              ← Updated (Fix Lost Buku Status)
│   ├── models.py            
│   ├── requirements.txt     
│   ├── schemas.py           
│   ├── .env                 ← Updated (host.docker.internal)
│   └── .env.example         ← Updated
├── docs/ 
│   ├── test/                
│   ├── api-documentation.md 
│   ├── api-test-results.md   
│   ├── auth-test-results.md
│   ├── docker-cheatsheet.md  ← BARU 
│   ├── image-comparison.md  ← BARU 
│   ├── env-setup.md
│   ├── schemadatabase.md    
│   ├── member-aqila.md
│   ├── member-Khanza_Nabila_Tsabita.md
│   ├── member-Maulana_Malik_Ibrahim.md
│   ├── member-Micka_Mayulia_Utama.md
│   ├── setup-guide.md      
│   └── ui-test-result.md
├── frontend/  
│   ├── frontend/
│   ├── node_modules/
│   ├── public/    
│   └── src/                ← Update
│        ├── App.jsx                  ← Update
│        ├── App.css                  ← Update
│        ├── main.jsx                 ← Update
│        └── components/
│            ├── Header.jsx           ← Update
│            ├── SearchBar.jsx        ← Update
│            ├── ItemForm.jsx         ← Update
│            ├── ItemList.jsx         ← Update
│            └── ItemCard.jsx         ← Update
├── .gitignore            
├── setup.sh                
└── README.md                         ← Update
```

## 📁 Tabel ERD
```
+-------------------+              +-----------------------+
|       USERS       |              |      TRANSACTIONS     |
+-------------------+              +-----------------------+
| user_id (PK/UUID) | 1          N | transaction_id (PK)   |
| email (UK)        |--------------| user_id (FK/UUID)     |
| password_hash     | (Melakukan)  | book_id (FK/UUID)     |
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
| category_id (PK)  |              +-----------+     |
| name (UK)         |              |   FINES   |     |
| description       |              +-----------+     |
+---------+---------+              | fine_id   |     |
          |                        | trans_id  |     |
          | 1                      | amount    |     |
          | (Memiliki)             | is_paid   |     |
          |                        +-----------+     |
          | N                                        |
+---------+---------+                                |
|       BOOKS       | 1                              |
+-------------------+--------------------------------+
| book_id (PK/UUID) |
| category_id (FK)  |
| isbn (UK)         |
| title             |
| author            |
| publisher         | 
| publication_year  | 
| total_stock       | 
| available_stock   |
+-------------------+
```

Berikut adalah detail arsitektur *database* PostgreSQL yang digunakan oleh aplikasi LenteraPustaka.

### 1. Tabel `users`
Menyimpan data otentikasi dan profil pengguna (Admin & Member).

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `user_id` | UUID | PK, Index | ID unik pengguna (Auto-generated). |
| `email` | String(255) | UK, Not Null | Alamat email unik untuk login. |
| `password_hash` | String(255) | Not Null | Password yang sudah di-enkripsi. |
| `full_name` | String(150) | Not Null | Nama lengkap pengguna. |
| `role` | String(10) | Not Null | 'admin' atau 'member'. |
| `created_at` | DateTime | TZ, Now() | Waktu pendaftaran. |

### 2. Tabel `categories`
Kategori buku untuk pengelompokan koleksi.

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `category_id` | Integer | PK, Auto-inc | ID unik kategori (bukan UUID). |
| `name` | String(100) | UK, Not Null | Nama kategori (Fiksi, Sains, dll). |
| `description` | Text | Nullable | Penjelasan singkat kategori. |

### 3. Tabel `books`
Inventaris utama buku perpustakaan.

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `book_id` | UUID | PK, Index | ID unik buku. |
| `category_id` | Integer | FK, Not Null | Relasi ke tabel `categories`. |
| `isbn` | String(20) | UK, Not Null | Nomor ISBN unik buku. |
| `title` | String(255) | Not Null, Index | Judul buku. |
| `author` | String(150) | Not Null | Nama penulis buku. |
| `publisher` | String(150) | Nullable | Nama penerbit buku. |
| `publication_year`| Integer | Nullable | Tahun terbit buku. |
| `total_stock` | Integer | Not Null | Total buku yang dimiliki. |
| `available_stock` | Integer | Not Null | Sisa buku yang bisa dipinjam saat ini. |

### 4. Tabel `transactions`
Mencatat sirkulasi peminjaman dan pengembalian.

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `transaction_id` | UUID | PK, Index | ID unik transaksi. |
| `user_id` | UUID | FK, Not Null | Relasi ke peminjam (`users`). |
| `book_id` | UUID | FK, Not Null | Relasi ke buku yang dipinjam (`books`). |
| `borrow_date` | DateTime | Not Null | Waktu buku mulai dipinjam. |
| `due_date` | DateTime | Not Null | Batas waktu pengembalian buku. |
| `return_date` | DateTime | Nullable | Waktu buku dikembalikan (kosong jika belum). |
| `status` | String(10) | Not Null | `borrowed`, `returned`, `overdue`, atau `lost`. |

### 5. Tabel `fines`
Data denda jika terjadi keterlambatan (Relasi 1:1 dengan Transaksi).

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `fine_id` | UUID | PK, Index | ID unik denda. |
| `transaction_id` | UUID | FK, UK, Not Null | Relasi unik ke satu transaksi spesifik. |
| `amount` | Integer | Not Null | Jumlah denda dalam mata uang Rupiah. |
| `is_paid` | Boolean | Not Null | Status pelunasan denda (`true` jika sudah lunas). |


## 🐳 Panduan Menjalankan Project (Local Deployment)

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi menggunakan Docker. Jika image belum tersedia di lokal, Docker akan otomatis menariknya dari Docker Hub.

### 1. Persiapan Network
Buat jaringan internal agar antar container bisa saling berkomunikasi:
```bash
docker network create lentera_net
```
### 2. Menjalankan Database (PostgreSQL)
Langkah ini akan membuat container database dan menyimpannya secara persistent di volume lentera_data:

```bash
docker run -d --name db \
  --network lentera_net \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lentera_pustaka \
  -p 5433:5432 \
  -v lentera_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

### 3. Menjalankan Backend (FastAPI)
Container ini akan menggunakan konfigurasi dari .env.docker:
```bash
docker run -d --name lentera_be \
  --network lentera_net \
  --env-file ./backend/.env.docker \
  -p 8000:8000 \
  x3naline/lentera-be:v1
```

### 4. Menjalankan Frontend (React/Vite)
Akses aplikasi melalui browser setelah langkah ini selesai:
```bash
docker run -d --name lentera_fe \
  --network lentera_net \
  -p 3000:80 \
  x3naline/lentera-fe:v1
```

### 5. Seeding Data (Opsional)
Jika ingin mengisi database dengan data awal, pastikan Python sudah terinstal dan jalankan:

```bash
# Gunakan port 5433 jika menjalankan seeder dari luar Docker
python seeder.py
```
#### 💡Note: Pastikan Anda sudah melakukan `docker login` jika diperlukan untuk mengakses repository image.


---
## 🧪 Hasil Pengujian (UI & API) & Panduan
* [Laporan Pengujian API (Swagger) - Modul 2](docs/api-test-results.md)
* [Ringkasan Spesifikasi & Parameter API - Modul 2](docs/api-summary.md)
* [Laporan Pengujian UI (React) - Modul 3](docs/ui-test-results.md)
* [Laporan Pengujian E2E (Autentikasi) - Modul 4](docs/auth-test-results.md) 
* [Panduan Konfigurasi Environment - Modul 4](docs/setup-guide.md)
* [API Documentation - Modul 4](docs/api-documentation.md)
* [Laporan Perbandingan Ukuran Base Image Docker - Modul 5](docs/image-comparison.md)
* [Docker Commands Cheat Sheet - Modul 5](docs/docker-cheatsheet.md)
* [Diagram Arsitektur Docker Multi-Container - Modul 6](docs/docker-architecture.md)
