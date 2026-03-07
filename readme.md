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

Backend
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend
```
cd frontend
npm install
npm run dev
```

Access
- API: http://localhost:8000"
- API Docs: http://localhost:8000/docs"
- Frontend: http://localhost:5173"

## 📅 Roadmap

| Minggu | Target | Status |
|--------|--------|--------|
| 1 | Setup & Hello World | ✅ |
| 2 | REST API + Database | ⬜ |
| 3 | React Frontend | ⬜ |
| 4 | Full-Stack Integration | ⬜ |
| 5-7 | Docker & Compose | ⬜ |
| 8 | UTS Demo | ⬜ |
| 9-11 | CI/CD Pipeline | ⬜ |
| 12-14 | Microservices | ⬜ |
| 15-16 | Final & UAS | ⬜ |

## 🗃️ Project Structure

```
CC-KELOMPOK-A-HEXACORE/
├── backend/
│   ├── crud.py              ← Baru
│   ├── database.py          ← Baru
│   ├── main.py
│   ├── models.py            ← Baru
│   ├── requirements.txt     ← Updated
│   ├── schemas.py           ← Baru
│   ├── .env                 
│   └── .env.example         ← Update
├── docs/ 
│   ├── test/                ← Baru
│   ├── api-test-results.md  ← Baru
│   ├── schemadatabase.md      ← Baru
│   ├── member-aqila.md
│   ├── member-Khanza_Nabila_Tsabita.md
│   ├── member-Maulana_Malik_Ibrahim.md
│   ├── member-Micka_Mayulia_Utama.md
├── frontend/  
│   ├── frontend/
│   ├── node_modules/
│   ├── public/    
│   └── src/   
├── .gitignore            
├── setup.sh            ← Baru
└── README.md
```

## 📁Tabel ERD
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
                                               | 1
                                               |
+-------------------+                          | (Memiliki)
|     CATEGORIES    |                          |
+-------------------+                          | 1
| category_id (PK)  | 1          N +-----------+-----------+
| name (UK)         |--------------|         FINES         |
| description       | (Membawahi)  +-----------------------+
+---------+---------+              | fine_id (PK/UUID)     |
          |                        | transaction_id (FK/UK)|
          | 1                      | amount                |
          |                        | is_paid               |
          | (Memiliki)             +-----------------------+
          |
          | N
+---------+---------+
|       BOOKS       |
+-------------------+
| book_id (PK/UUID) |
| category_id (FK)  |
| isbn (UK)         |
| title             |
| author            |
| available_stock   |
+-------------------+
```

## Dokumentasi Endpoint API
| method | URL | request body | response example |
|--------|--------|--------|--------|