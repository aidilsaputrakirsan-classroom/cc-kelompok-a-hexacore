Berikut adalah detail arsitektur *database* PostgreSQL yang digunakan oleh aplikasi LenteraPustaka.

### 1. Tabel `users`
Menyimpan data otentikasi dan profil pengguna (Admin & Member).

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `user_id` | Integer | PK, Auto-inc | ID unik pengguna. |
| `email` | String(255) | UK, Not Null | Alamat email unik untuk login. |
| `password_hash` | String(255) | Not Null | Password yang sudah di-enkripsi. |
| `full_name` | String(150) | Not Null | Nama lengkap pengguna. |
| `role` | String(10) | Not Null | 'admin' atau 'member'. |
| `created_at` | DateTime | TZ, Now() | Waktu pendaftaran. |

### 2. Tabel `categories`
Kategori buku utama untuk pengelompokan koleksi.

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `category_id` | Integer | PK, Auto-inc | ID unik kategori. |
| `name` | String(100) | UK, Not Null | Nama kategori (Fiksi, Sains, dll). |
| `description` | Text | Nullable | Penjelasan singkat kategori. |

### 3. Tabel `genres`
Detail genre buku yang lebih spesifik.

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `genre_id` | Integer | PK, Auto-inc | ID unik genre. |
| `name` | String(100) | UK, Not Null | Nama genre (Misal: Fantasi, Horor). |
| `description` | Text | Nullable | Penjelasan singkat genre. |

### 4. Tabel `books`
Inventaris utama buku perpustakaan.

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `book_id` | Integer | PK, Auto-inc | ID unik buku. |
| `category_id` | Integer | FK, Not Null | Relasi ke tabel `categories`. |
| `isbn` | String(20) | UK, Nullable | Nomor ISBN unik buku. |
| `title` | String(255) | Not Null, Index | Judul buku. |
| `author` | String(150) | Not Null | Nama penulis buku. |
| `publisher` | String(150) | Nullable | Nama penerbit buku. |
| `publication_year`| Integer | Nullable | Tahun terbit buku. |
| `synopsis` | Text | Nullable | Sinopsis atau ringkasan cerita buku. |
| `total_stock` | Integer | Not Null | Total buku yang dimiliki. |
| `available_stock` | Integer | Not Null | Sisa buku yang bisa dipinjam saat ini. |
| `cover_image_url` | String(500) | Nullable | Tautan gambar sampul buku. |

### 5. Tabel `book_genres`
Tabel relasi (Junction Table) untuk menghubungkan buku dengan banyak genre (*Many-to-Many*).

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `book_id` | Integer | PK, FK | Relasi ke tabel `books` (Cascade Delete). |
| `genre_id` | Integer | PK, FK | Relasi ke tabel `genres` (Cascade Delete). |

### 6. Tabel `transactions`
Mencatat sirkulasi peminjaman dan pengembalian.

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `transaction_id` | Integer | PK, Auto-inc | ID unik transaksi. |
| `user_id` | Integer | FK, Not Null | Relasi ke peminjam (`users`). |
| `book_id` | Integer | FK, Not Null | Relasi ke buku yang dipinjam (`books`). |
| `borrow_date` | DateTime | Not Null | Waktu buku mulai dipinjam. |
| `due_date` | DateTime | Not Null | Batas waktu pengembalian buku. |
| `return_date` | DateTime | Nullable | Waktu buku dikembalikan (kosong jika belum). |
| `status` | String(10) | Not Null | `borrowed`, `returned`, `overdue`, atau `lost`. |

### 7. Tabel `fines`
Data denda jika terjadi keterlambatan (Relasi 1:1 dengan Transaksi).

| Kolom | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| `fine_id` | Integer | PK, Auto-inc | ID unik denda. |
| `transaction_id` | Integer | FK, UK, Not Null | Relasi unik ke satu transaksi spesifik. |
| `amount` | Integer | Not Null | Jumlah denda dalam mata uang Rupiah. |
| `status` | String(25) | Not Null | Status verifikasi pembayaran denda. |
| `payment_proof_url` | String(500) | Nullable | URL bukti transfer/pembayaran denda. |
| `rejection_note` | Text | Nullable | Catatan admin jika bukti pembayaran ditolak. |