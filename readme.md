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

Setup.sh
```
./setup.sh
```

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
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

## 📅 Roadmap

| Minggu | Target | Status |
|--------|--------|--------|
| 1 | Setup & Hello World | ✅ |
| 2 | REST API + Database | ✅ |
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
│   ├── schemadatabase.md    ← Baru
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
├── setup.sh                 ← Baru
└── README.md
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

_Sources:_ [docs/api-test-results.md](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-hexacore/blob/main/docs/api-test-results.md) | [setup.sh](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-hexacore/blob/main/setup.sh)