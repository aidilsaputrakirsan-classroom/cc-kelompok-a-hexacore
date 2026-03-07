# SCHEMA DATABASE
```
USERS {
    uuid user_id PK
    string email UK
    string password_hash
    string full_name
    string role
    datetime created_at
}

CATEGORIES {
    int category_id PK
    string name UK
    text description
}

BOOKS {
    uuid book_id PK
    int category_id FK
    string isbn UK
    string title
    string author
    string publisher
    int publication_year
    int total_stock
    int available_stock
}

TRANSACTIONS {
    uuid transaction_id PK
    uuid user_id FK
    uuid book_id FK
    datetime borrow_date
    datetime due_date
    datetime return_date
    string status
}

FINES {
    uuid fine_id PK
    uuid transaction_id FK
    int amount
    boolean is_paid
}
```

# Gambar ERD
![alt text](<test/ERD HEXACORE.jpg>)

# Details Tabels

## 1. Users

Menyimpan data otentikasi dan profil pengguna (Admin & Member).

| Kolom | Tipe Data | Constraint | Deskripsi |
|--------|--------|--------|--------|
| user_id | UUID | PK, Index | ID unik pengguna (Auto-generated). |
| email | String(255) | UK, Not Null | Alamat email unik untuk login. |
| password_hash | String(255) | Not Null | Password yang sudah di-enkripsi. |
| full_name | String(150) | Not Null | Nama lengkap pengguna. |
| role | String(10) | Not Null | 'admin' atau 'member'. |
| created_at | DateTime | TZ, Now() | Waktu pendaftaran. |

## 2. Categories
Kategori buku untuk pengelompokan koleksi.
| Kolom | Tipe Data | Constraint | Deskripsi |
|--------|--------|--------|--------|
| category_id | Integer | PK, Auto-inc | ID unik kategori (bukan UUID). |
| name | String(100) | UK, Not Null | Nama kategori (Fiksi, Sains, dll). |
| description | Text | Nullable | Penjelasan singkat kategori. |

## 3. Books
Inventaris utama buku perpustakaan.
| Kolom | Tipe Data | Constraint | Deskripsi |
|--------|--------|--------|--------|
| book_id | UUID | PK, Index | ID unik buku. |
| category_id | Integer | FK, Not Null | Relasi ke tabel categories. |
| isbn | String(20) | UK, Not Null | Nomor ISBN unik buku. |
| title | String(255) | Not Null, Index | Judul buku. |
| total_stock | Integer | Not Null | Total buku yang dimiliki. |
| available_stock| Integer | Not Null | Sisa buku yang bisa dipinjam. |

## 4. Transactions
Mencatat sirkulasi peminjaman dan pengembalian.
| Kolom | Tipe Data | Constraint | Deskripsi |
|--------|--------|--------|--------|
| transaction_id| UUID | PK, Index | ID unik transaksi. |
| user_id | UUID | FK, Not Null | Relasi ke peminjam (users). |
| book_id | UUID | FK, Not Null | Relasi ke buku yang dipinjam (books). |
| status | String(10) | Not Null | borrowed, returned, overdue, lost. |

## 5. Fines
Data denda jika terjadi keterlambatan (Relasi 1:1 dengan Transaksi).
| Kolom | Tipe Data | Constraint | Deskripsi |
|--------|--------|--------|--------|
| fine_id | UUID | PK, Index | ID unik denda. |
| transaction_id| UUID | FK, UK, Not Null | Relasi unik ke satu transaksi. |
| amount | Integer | Not Null | Jumlah denda dalam Rupiah. |
| is_paid | Boolean | Not Null | Status pelunasan denda. |