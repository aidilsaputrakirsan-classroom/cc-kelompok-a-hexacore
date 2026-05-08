# ☁️ Cloud App - [LenteraPustaka]
![CI Pipeline](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-hexacore/actions/workflows/ci.yml/badge.svg)

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
(Port 3000/5173)              (Port 8000)
```

## 🤖 Getting Started

Kami merekomendasikan penggunaan **Docker Compose** agar seluruh sistem dapat berjalan serentak secara otomatis. Namun, kami juga menyediakan panduan *Quick Start* (Native) untuk kebutuhan *development* atau pengujian manual per modul.

Kami telah menyediakan panduan langkah-demi-langkah yang lengkap untuk menjalankan proyek ini di berbagai perangkat.

### 🐳 Panduan Menjalankan Project (Docker Compose)

Proyek ini sudah terkonfigurasi penuh menggunakan Docker Compose untuk memudahkan proses deployment lokal.

#### 1. Jalankan Seluruh Sistem  
Buka terminal di root folder proyek dan jalankan perintah:
```bash
docker compose up -d
```
(Perintah ini akan secara otomatis membuat network lentera_net, menyiapkan volume lentera_data, dan menyalakan Database, Backend, serta Frontend secara bersamaan).

#### 2. Cek Status Aplikasi
Pastikan ketiga services sudah berstatus Up (healthy):

```bash
docker compose ps
```

#### 3. Akses Aplikasi
- Frontend (UI): http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation (Swagger): http://localhost:8000/docs

#### 4. Mematikan Sistem
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
| 9-11 | CI/CD Pipeline | ⬜ |
| 12-14 | Microservices | ⬜ |
| 15-16 | Final & UAS | ⬜ |

## 🗃️ Project Structure

```
CC-KELOMPOK-A-HEXACORE/
├── .github/
│   ├── CODEOWNERS
│   ├── pull_request_template.md
│   └── workflows/
│       └── ci.yml                     ← Baru
├── backend/
│   ├── static/   
│   ├── Dockerfile           
│   ├── .dockerignore                   
│   ├── crud.py              
│   ├── database.py
│   ├── main.py              
│   ├── models.py            
│   ├── requirements.txt               ← Updated (pytest, httpx)
│   ├── pytest.ini                     ← Baru
│   ├── tests/                         ← Baru
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_items.py
│   │   └── test_health.py
│   ├── schemas.py           
│   ├── .env                 
│   └── .env.example         
├── docs/ 
│   ├── test/                
│   ├── api-documentation.md 
│   ├── api-test-results.md   
│   ├── auth-test-results.md
│   ├── docker-cheatsheet.md   
│   ├── image-comparison.md  
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
│   ├── vite.config.js                 ← Updated (test config)
│   ├── package.json                   ← Updated (test scripts)
│   └── src/                
│        ├── App.jsx                  
│        ├── App.css                  
│        ├── main.jsx                 
│        └── components/
│        │   ├── Header.jsx           
│        │   ├── SearchBar.jsx        
│        │   ├── ItemForm.jsx         
│        │   ├── ItemList.jsx         
│        │   └── ItemCard.jsx         
│        └── test/                      ← Baru
│            └── setup.js
│            └── api.test.js
├── docker-compose.yml                
├── docker-compose.prod.yml           
├── .gitignore            
├── Makefile
├── setup.sh                
└── README.md                          ← Updated (CI badge)
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

## 📡 Dokumentasi & Hasil Testing Endpoint API

Berikut adalah daftar *endpoint* beserta bukti pengujian menggunakan Swagger/Thunder Client. 

*(Daftar pengujian mencakup 6 poin utama dengan total 22 sub-poin)*:
<br><img src="docs/test/categories.png" width="500">

| No | method | URL | request body | response example |
|:--:|--------|--------|--------|--------|
| **1** | `GET` | `/system/health` | *-* | Status `healthy` v0.3.0<br><img src="docs/test/systemget1.png" width="300"> |
| **2** | `GET` | `/system/team` | *-* | Data tim beranggotakan 4 orang<br><img src="docs/test/responsystemget.png" width="300"> |
| **3** | `POST` | `/categories` | <pre><code>{"name": "Non-Fiksi", "description": "Karya tulis informatif..."}</code></pre><img src="docs/test/post4.png" width="300"> | Berhasil membuat data kategori<br><img src="docs/test/responspost.png" width="300"> |
| **4** | `GET` | `/categories` | *-* | Menampilkan *list* kategori<br><img src="docs/test/responsget.png" width="300"> |
| **5** | `GET` | `/categories/{category_id}` | Parameter: `category_id = 1`<br><img src="docs/test/get2.png" width="300"> | Menampilkan detail kategori ID 1<br><img src="docs/test/responsget2.png" width="300"> |
| **6** | `PUT` | `/categories/{category_id}` | `category_id = 1`<br><pre><code>{"name": "Fiksi", "description": "Karya sastra naratif..."}</code></pre><img src="docs/test/put3.png" width="300"> | Data kategori berhasil di-update<br><img src="docs/test/responsput.png" width="300"> |
| **7** | `DELETE` | `/categories/{category_id}` | Parameter: `category_id = 1`<br><img src="docs/test/delete1.png" width="300"> | `access-control-allow-credentials: true`<br><img src="docs/test/responsdelete1.png" width="300"> |
| **8** | `GET` | `/categories` | *(Pengecekan setelah hapus)*<br>*-* | Kategori ID 1 sudah terhapus<br><img src="docs/test/getdelete.png" width="300"> |
| **9** | `POST` | `/books` | <pre><code>{"category_id": 1, "isbn": "978-602-033-294-9", "title": "Bulan", "author": "Tere Liye", "total_stock": 5...}</code></pre><img src="docs/test/bookspost1.png" width="300"> | Berhasil membuat data buku<br><img src="docs/test/responspostbook.png" width="300"> |
| **10** | `GET` | `/books/stats` | *(Statistik inventaris awal)*<br>*-* | Menampilkan statistik total buku<br><img src="docs/test/getbookawalpng" width="300"> |
| **11** | `GET` | `/books` | Parameter: `ISBN = 978-602-033-294-9`<br><img src="docs/test/getbook.png" width="300"> | Menampilkan hasil pencarian buku<br><img src="docs/test/responsgetbook.png" width="300"> |
| **12** | `GET` | `/books/{book_id}` | Parameter: `book_id`<br><img src="docs/test/getbook2.png" width="300"> | Menampilkan detail spesifik buku<br><img src="docs/test/responsgetbook2.png" width="300"> |
| **13** | `PUT` | `/books/{book_id}` | `book_id`<br><pre><code>{"available_stock": 3...}</code></pre><img src="docs/test/putbook.png" width="300"> | Stok buku berhasil di-update<br><img src="docs/test/responsputbook.png" width="300"> |
| **14** | `GET` | `/books/stats` | *(Cek statistik pasca update)*<br>*-* | Perubahan statistik inventaris<br><img src="docs/test/getbookput.png" width="300"> |
| **15** | `DELETE` | `/books/{book_id}` | Parameter: `book_id`<br>*-* | Data buku berhasil dihapus<br><img src="docs/test/responsdeletebook.png" width="300"> |
| **16** | `GET` | `/books` | *(Pengecekan setelah hapus)*<br>*-* | Menampilkan *list* buku terbaru<br><img src="docs/test/responsgetdeletebook.png" width="300"> |
| **17** | `GET` | `/books/stats` | *(Cek statistik pasca hapus)*<br>*-* | Statistik inventaris berkurang<br><img src="docs/test/getbookdelete.png" width="300"> |
| **18** | `POST` | `/user` | <pre><code>{"email": "micka@example.com", "password": "password456", "full_name": "Micka Mayulia", "role": "member"}</code></pre><img src="docs/test/postuser.png" width="300"> | Berhasil membuat *user* baru<br><img src="docs/test/responsputuser.png" width="300"> |
| **19** | `GET` | `/user` | *-* | Menampilkan *list* *user*<br><img src="docs/test/responsgetuser.png" width="300"> |
| **20** | `GET` | `/user/{user_id}` | Parameter: `user_id`<br><img src="docs/test/getuser2.png" width="300"> | Menampilkan detail *user*<br><img src="docs/test/responsgetuser2.png" width="300"> |
| **21** | `POST` | `/transaction` | <pre><code>{"user_id": "96b872f9...", "book_id": "29efea5f...", "due_date": "2026-03-07..."}</code></pre><img src="docs/test/postransaction.png" width="300"> | Peminjaman buku berhasil dicatat<br><img src="docs/test/responspostransaction.png" width="300"> |
| **22** | `GET` | `/transaction` | Menampilkan status (dipinjam, dikembalikan, dll)<br><img src="docs/test/getransaction.png" width="300"> | Menampilkan *list* transaksi<br><img src="docs/test/responsgetransaction.png" width="300"> |
| **23** | `GET` | `/transaction/{id}` | Parameter: `transaction_id`<br><img src="docs/test/getransaction2.png" width="300"> | Menampilkan detail transaksi spesifik<br><img src="docs/test/responsgetransaction2.png" width="300"> |
| **24** | `PUT` | `/transaction/{id}` | Parameter: `transaction_id`<br><img src="docs/test/putransaction.png" width="300"> | Pembaruan status transaksi berhasil<br><img src="docs/test/responsputransaction.png" width="300"> |
| **25** | `GET` | `/fines` | Parameter: `belum lunas`<br><img src="docs/test/getfines.png" width="300"> | Menampilkan detail denda berjalan<br><img src="docs/test/responsgetfines.png" width="300"> |
| **26** | `PUT` | `/fines/{fines_id}` | Parameter: `fines_id`<br><img src="docs/test/putfines.png" width="300"> | Status pelunasan berhasil di-update<br><img src="docs/test/responsputfines.png" width="300"> |
| **27** | `GET` | `/fines` | Parameter: `lunas`<br><img src="docs/test/getfines2.png" width="300"> | Menampilkan riwayat denda lunas<br><img src="docs/test/responsgetfines2.png" width="300"> |

  
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

**🎯 Persiapan UTS & Arsitektur Utama**
* 🚀 **[Naskah Demo UTS Kelompok Hexacore](docs/uts-demo-script.md)**
* 🗄️ **[Detail Skema Database & ERD Terkini](docs/SchemaDatabase.md)**

