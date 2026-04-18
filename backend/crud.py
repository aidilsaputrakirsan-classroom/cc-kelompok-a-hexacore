import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from models import Book, Category, Genre, Fine, Transaction, User
from schemas import (
    BookCreate, BookUpdate,
    BookStatsResponse,
    CategoryCreate, GenreCreate,
    TransactionCreate,
    UserCreate, UserUpdate,
)

from auth import hash_password, verify_password

# File ini menampung operasi database dan business logic utama backend.
# Endpoint di main.py memanggil fungsi-fungsi di sini agar aturan bisnis tetap
# terpusat dan tidak tersebar di layer routing.

# ============================================================
# KONSTANTA
# ============================================================
FINE_PER_DAY = 1_000   # Rp 1.000 per hari keterlambatan
LOST_BOOK_FINE = 100_000 # Rp 100.000 denda fix buku hilang


# ============================================================
# HELPER — PASSWORD dihapus (sekarang memakai auth.py)
# ============================================================


# ============================================================
# CRUD: CATEGORY
# ============================================================

def create_category(db: Session, data: CategoryCreate) -> Category:
    """Buat kategori buku baru."""
    category = Category(name=data.name, description=data.description)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def get_categories(db: Session, skip: int = 0, limit: int = 100) -> list[Category]:
    """Ambil semua kategori."""
    return db.query(Category).offset(skip).limit(limit).all()


def get_category(db: Session, category_id: int) -> Optional[Category]:
    """Ambil satu kategori berdasarkan ID."""
    return db.query(Category).filter(Category.category_id == category_id).first()


def update_category(db: Session, category_id: int, data: CategoryCreate) -> Optional[Category]:
    """Update nama/deskripsi kategori."""
    category = get_category(db, category_id)
    if not category:
        return None
    category.name        = data.name
    category.description = data.description
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> bool:
    """Hapus kategori. Gagal jika masih ada buku di kategori ini."""
    category = get_category(db, category_id)
    if not category:
        return False
    db.delete(category)
    db.commit()
    return True


# ============================================================
# CRUD: GENRE
# ============================================================

def create_genre(db: Session, data: GenreCreate) -> Genre:
    """Buat referensi genre baru."""
    genre = Genre(name=data.name, description=data.description)
    db.add(genre)
    db.commit()
    db.refresh(genre)
    return genre


def get_genres(db: Session, skip: int = 0, limit: int = 100) -> list[Genre]:
    """Ambil semua genre (untuk filter/dropdown)."""
    return db.query(Genre).offset(skip).limit(limit).all()


def get_genre(db: Session, genre_id: int) -> Optional[Genre]:
    """Ambil satu genre spesifik."""
    return db.query(Genre).filter(Genre.genre_id == genre_id).first()


def update_genre(db: Session, genre_id: int, data: GenreCreate) -> Optional[Genre]:
    """Update detail genre."""
    genre = get_genre(db, genre_id)
    if not genre:
        return None
    genre.name        = data.name
    genre.description = data.description
    db.commit()
    db.refresh(genre)
    return genre


def delete_genre(db: Session, genre_id: int) -> bool:
    """Hapus genre."""
    genre = get_genre(db, genre_id)
    if not genre:
        return False
    db.delete(genre)
    db.commit()
    return True

# ============================================================
# CRUD: BOOK
# ============================================================

def create_book(db: Session, data: BookCreate) -> Book:
    """Tambah buku baru ke inventaris beserta relasi genrenya."""
    if data.available_stock > data.total_stock:
        raise ValueError("available_stock tidak boleh lebih besar dari total_stock")

    # Data buku inti dibuat lebih dulu, lalu relasi many-to-many genre dirakit setelahnya.
    book = Book(
        category_id      = data.category_id,
        isbn             = data.isbn,
        title            = data.title,
        author           = data.author,
        publisher        = data.publisher,
        publication_year = data.publication_year,
        synopsis         = data.synopsis,
        cover_image_url  = data.cover_image_url,
        total_stock      = data.total_stock,
        available_stock  = data.available_stock,
    )
    
    # Query genre dilakukan berdasarkan daftar ID yang dikirim frontend, lalu ditempelkan ke object book.
    if data.genre_ids:
        genres_query = db.query(Genre).filter(Genre.genre_id.in_(data.genre_ids)).all()
        book.genres.extend(genres_query)

    db.add(book)
    db.commit()
    db.refresh(book)
    return book


def get_books(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
) -> dict:
    """
    Ambil daftar buku dengan pagination dan pencarian.
    Search mencakup: title, author, isbn.
    """
    # Query dasar dapat dipakai apa adanya atau dipersempit dengan keyword pencarian.
    query = db.query(Book)
    if search:
        kw = f"%{search}%"
        # Satu keyword bisa mencari judul, penulis, atau ISBN sekaligus.
        query = query.filter(
            or_(
                Book.title.ilike(kw),
                Book.author.ilike(kw),
                Book.isbn.ilike(kw),
            )
        )
    total = query.count()
    books = query.offset(skip).limit(limit).all()
    return {"total": total, "books": books}


def get_book(db: Session, book_id: int) -> Optional[Book]:
    """Ambil satu buku berdasarkan ID."""
    return db.query(Book).filter(Book.book_id == book_id).first()


def update_book(db: Session, book_id: int, data: BookUpdate) -> Optional[Book]:
    """Update data buku — hanya field yang dikirim yang diubah (partial update)."""
    book = get_book(db, book_id)
    if not book:
        return None
    update_data = data.model_dump(exclude_unset=True)

    final_total_stock = update_data.get("total_stock", book.total_stock)
    final_available_stock = update_data.get("available_stock", book.available_stock)
    if final_available_stock > final_total_stock:
        raise ValueError("available_stock tidak boleh lebih besar dari total_stock")
    
    # Handle genre_ids terpisah karena relasi M2M
    if "genre_ids" in update_data:
        genre_ids = update_data.pop("genre_ids")
        if genre_ids is not None:
            # Ganti semua genre lama dengan list genre yang baru
            new_genres = db.query(Genre).filter(Genre.genre_id.in_(genre_ids)).all()
            book.genres = new_genres
            
    # Modify basic columns
    for field, value in update_data.items():
        setattr(book, field, value)
        
    db.commit()
    db.refresh(book)
    return book


def delete_book(db: Session, book_id: int) -> bool:
    """Hapus buku dari inventaris."""
    book = get_book(db, book_id)
    if not book:
        return False
    db.delete(book)
    db.commit()
    return True


def get_book_stats(db: Session) -> BookStatsResponse:
    """
    Statistik inventaris buku:
    - total_titles    : jumlah judul unik
    - total_stock     : total eksemplar seluruh buku
    - available_stock : jumlah stok tersedia saat ini
    - borrowed_count  : transaksi dengan status 'borrowed'
    - overdue_count   : transaksi dengan status 'overdue'
    """
    books = db.query(Book).all()

    total_titles    = len(books)
    total_stock     = sum(b.total_stock     for b in books)
    available_stock = sum(b.available_stock for b in books)

    borrowed_count = (
        db.query(Transaction)
        .filter(Transaction.status == "borrowed")
        .count()
    )
    overdue_count = (
        db.query(Transaction)
        .filter(Transaction.status == "overdue")
        .count()
    )

    return BookStatsResponse(
        total_titles    = total_titles,
        total_stock     = total_stock,
        available_stock = available_stock,
        borrowed_count  = borrowed_count,
        overdue_count   = overdue_count,
    )


# ============================================================
# CRUD: USER
# ============================================================

def create_user(db: Session, data: UserCreate) -> Optional[User]:
    """
    Daftarkan user baru.
    Return None jika email sudah terdaftar.
    """
    # Email harus unik agar tidak ada dua akun dengan identitas login yang sama.
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        return None
    # Password tidak pernah disimpan mentah; hashing dilakukan sebelum object User dibuat.
    user = User(
        email         = data.email,
        password_hash = hash_password(data.password),
        full_name     = data.full_name,
        role          = data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_users(db: Session, skip: int = 0, limit: int = 50) -> list[User]:
    """Ambil semua user."""
    return db.query(User).offset(skip).limit(limit).all()


def get_user(db: Session, user_id: int) -> Optional[User]:
    """Ambil satu user berdasarkan ID."""
    return db.query(User).filter(User.user_id == user_id).first()


def update_user(db: Session, user_id: int, data: UserUpdate) -> Optional[User]:
    """
    Update data user — hanya field yang dikirim yang diubah (partial update).
    Bisa digunakan admin untuk mengubah role, nama, atau email user.
    """
    user = get_user(db, user_id)
    if not user:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    """
    Hapus user dari sistem.
    Return False jika user tidak ditemukan.
    """
    user = get_user(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Autentikasi user: cek email & password.
    Digunakan nanti di Modul 4 (JWT Auth).
    """
    # Login dianggap gagal jika email tidak ditemukan atau hash password tidak cocok.
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def admin_reset_password(db: Session, user_id: int, new_password: str) -> Optional[User]:
    """Admin mereset paksa password user manapun tanpa validasi sandi lama."""
    user = get_user(db, user_id)
    if not user:
        return None
    user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user


def member_change_password(db: Session, user_id: int, current_password: str, new_password: str) -> Optional[User]:
    """Member ganti sandi sendiri dengan wajib mengisi sandi lama secara akurat."""
    user = get_user(db, user_id)
    if not user:
        return None
    if not verify_password(current_password, user.password_hash):
        raise ValueError("Password saat ini tidak cocok dengan database")
    user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user


# ============================================================
# BUSINESS LOGIC: TRANSACTION (BORROW — PENDING)
# ============================================================

def create_transaction(db: Session, data: TransactionCreate) -> Optional[Transaction]:
    """
    Ajukan peminjaman buku (status awal: 'pending').

    Business rules:
    1. Validasi user dan buku ada
    2. Cek denda: Tolak jika user punya denda belum lunas (unpaid/pending/rejected)
    3. Cek available_stock > 0 — jika habis, return None
    4. Stok BELUM dikurangi (menunggu persetujuan admin)
    5. Buat transaksi dengan status 'pending'

    Return:
    - Transaction berstatus 'pending' jika berhasil
    - None jika stok habis
    - Raise ValueError jika user/buku tidak ditemukan atau ada denda
    """
    # Tahap 1: validasi user peminjam harus benar-benar ada di database.
    user = get_user(db, data.user_id)
    if not user:
        raise ValueError(f"User id={data.user_id} tidak ditemukan")

    # Tahap 2: user dengan denda aktif diblokir agar tidak menumpuk kewajiban baru.
    unpaid_fine = db.query(Fine).join(Transaction).filter(
        Transaction.user_id == data.user_id,
        Fine.status.in_(["unpaid", "pending_verification", "rejected"])
    ).first()
    
    if unpaid_fine:
        raise ValueError("Gagal meminjam: Anda masih memiliki denda yang belum dilunasi. Harap lunasi denda Anda terlebih dahulu.")

    # Tahap 3: buku target harus ada sebelum stok dan tanggal pinjam diproses.
    book = get_book(db, data.book_id)
    if not book:
        raise ValueError(f"Buku id={data.book_id} tidak ditemukan")

    # Cek stok — jika habis, tolak pengajuan
    # Tahap 4: stok dicek di awal, tetapi belum dikurangi karena transaksi masih menunggu approval admin.
    if book.available_stock <= 0:
        return None   # Caller akan raise HTTP 400

    # Hitung due_date otomatis (7 hari dari sekarang)
    # Tahap 5: due_date dihitung otomatis agar aturan masa pinjam konsisten untuk semua transaksi.
    borrow_date = datetime.now(timezone.utc)
    due_date = borrow_date + timedelta(days=7)

    # Buat transaksi berstatus pending (stok belum berkurang)
    # Tahap 6: simpan transaksi sebagai pending; pengurangan stok baru terjadi saat approve.
    trx = Transaction(
        user_id  = data.user_id,
        book_id  = data.book_id,
        borrow_date = borrow_date,
        due_date = due_date,
        status   = "pending",
    )
    db.add(trx)
    db.commit()
    db.refresh(trx)
    return trx


# ============================================================
# TESTING HELPER: TIME TRAVEL (Simulasi Terlambat)
# ============================================================

def simulate_overdue(db: Session, transaction_id: int, days_late: int = 3) -> Optional[Transaction]:
    """
    HANYA UNTUK TESTING: Memundurkan due_date ke masa lalu agar saat
    buku di-return, sistem mendeteksi keterlambatan dan membuat denda.
    """
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status != "borrowed":
        raise ValueError("Hanya transaksi 'borrowed' yang bisa disimulasikan telat")
    
    # Mundurkan due_date ke (hari ini - days_late)
    now = datetime.now(timezone.utc)
    trx.due_date = now - timedelta(days=days_late)
    
    db.commit()
    db.refresh(trx)
    return trx


# ============================================================
# BUSINESS LOGIC: TRANSACTION — APPROVE (Admin)
# ============================================================

def approve_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
    """
    Admin menyetujui pengajuan peminjaman (pending → borrowed).

    Business rules:
    1. Cek transaksi ada dan statusnya 'pending'
    2. Decrement available_stock buku
    3. Ubah status menjadi 'borrowed'

    Return:
    - Transaction berstatus 'borrowed' jika berhasil
    - None jika transaksi tidak ditemukan atau statusnya bukan 'pending'
    """
    # Approval admin adalah titik saat transaksi resmi aktif dan stok benar-benar berkurang.
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status != "pending":
        return None   # Hanya bisa approve yang masih pending

    book = get_book(db, trx.book_id)
    if not book:
        return None  # Buku hilang/dihapus (kasus sangat jarang)

    if book.available_stock <= 0:
        raise ValueError("Stok buku ini sudah habis — tidak dapat disetujui")

    # available_stock dikurangi di sini karena buku baru dianggap keluar setelah disetujui admin.
    book.available_stock -= 1
    trx.status = "borrowed"

    db.commit()
    db.refresh(trx)
    return trx


# ============================================================
# BUSINESS LOGIC: TRANSACTION — REJECT (Admin)
# ============================================================

def reject_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
    """
    Admin menolak pengajuan peminjaman (pending → rejected).

    Business rules:
    1. Cek transaksi ada dan statusnya 'pending'
    2. Ubah status menjadi 'rejected'
    3. Stok tidak berubah (karena memang belum dikurangi)

    Return:
    - Transaction berstatus 'rejected' jika berhasil
    - None jika transaksi tidak ditemukan atau statusnya bukan 'pending'
    """
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status != "pending":
        return None   # Hanya bisa reject yang masih pending

    trx.status = "rejected"
    db.commit()
    db.refresh(trx)
    return trx


# ============================================================
# BUSINESS LOGIC: TRANSACTION (RETURN)
# ============================================================

def return_book(db: Session, transaction_id: int) -> Optional[Transaction]:
    """
    Proses pengembalian buku (return).

    Business rules:
    1. Cek transaksi ada dan statusnya 'borrowed'
    2. Isi return_date = sekarang
    3. Increment available_stock buku
    4. Hitung keterlambatan:
       - Jika return_date > due_date → status = 'overdue'
       - Auto-buat Fine (denda) = selisih hari × FINE_PER_DAY
       - Jika tepat waktu → status = 'returned'

    Return:
    - Transaction yang sudah di-update
    - None jika transaksi tidak ditemukan atau belum berstatus 'borrowed'
    """
    # Tahap 1: hanya transaksi borrowed yang boleh diproses sebagai pengembalian.
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status != "borrowed":
        return None   # Hanya bisa return yang sedang dipinjam

    # Tahap 2: waktu pengembalian dicatat sebagai referensi audit dan perhitungan telat.
    now = datetime.now(timezone.utc)
    trx.return_date = now

    # Tahap 3: stok tersedia dikembalikan karena buku fisik sudah masuk lagi ke perpustakaan.
    book = get_book(db, trx.book_id)
    if book:
        book.available_stock += 1

    # Tahap 4: due_date dinormalisasi ke UTC agar perbandingan waktu tetap konsisten.
    due = trx.due_date
    if due.tzinfo is None:
        due = due.replace(tzinfo=timezone.utc)

    if now > due:
        # Jika terlambat, transaksi ditandai overdue dan denda otomatis dibuat.
        trx.status  = "overdue"
        days_late   = (now - due).days or 1   # minimal 1 hari
        fine_amount = days_late * FINE_PER_DAY

        fine = Fine(
            transaction_id = trx.transaction_id,
            amount         = fine_amount,
            status         = "unpaid",
        )
        db.add(fine)
    else:
        trx.status = "returned"

    db.commit()
    db.refresh(trx)
    return trx


# ============================================================
# BUSINESS LOGIC: TRANSACTION (LOST BOOK)
# ============================================================

def report_book_lost(db: Session, transaction_id: int) -> Optional[Transaction]:
    """
    Proses pelaporan buku hilang (lost).

    Business rules:
    1. Cek transaksi ada dan statusnya 'borrowed' atau 'overdue'.
    2. Ubah status transaksi menjadi 'lost'.
    3. Kurangi total_stock buku sebanyak 1 (buku fisik lenyap).
    4. Tambahkan denda:
       - Jika belum ada denda, buat Fine baru senilai LOST_BOOK_FINE.
       - Jika sudah ada denda (akibat overdue), tambahkan amount dengan LOST_BOOK_FINE.
    """
    # Hanya transaksi aktif yang masih memegang buku yang boleh dilaporkan hilang.
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status not in ["borrowed", "overdue"]:
        raise ValueError("Hanya buku yang sedang dipinjam (borrowed/overdue) yang bisa dilaporkan hilang.")
    
    # total_stock dikurangi karena koleksi fisik perpustakaan benar-benar berkurang permanen.
    book = get_book(db, trx.book_id)
    if book and book.total_stock > 0:
        book.total_stock -= 1
        # Catatan: available_stock tidak ditambah karena bukunya tidak pernah kembali
    
    # Jika denda sudah ada akibat overdue, nominal buku hilang diakumulasikan ke denda yang sama.
    fine = db.query(Fine).filter(Fine.transaction_id == transaction_id).first()
    if fine:
        # Jika sebelumnya sudah overdue dan denda sudah terbentuk, tambahkan denda buku hilang
        fine.amount += LOST_BOOK_FINE
        fine.status = "unpaid"  # Pastikan reset ke unpaid jika member belum melunasi
    else:
        # Jika buku masih berstatus borrowed dan lapor hilang
        fine = Fine(
            transaction_id = trx.transaction_id,
            amount         = LOST_BOOK_FINE,
            status         = "unpaid",
        )
        db.add(fine)

    trx.status = "lost"
    db.commit()
    db.refresh(trx)
    return trx


def get_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
) -> dict:
    """
    Ambil daftar transaksi dengan filter opsional berdasarkan status.
    Jika user_id diberikan, hanya kembalikan transaksi milik user tersebut (untuk member).
    Status: 'pending' | 'borrowed' | 'returned' | 'overdue' | 'rejected' | 'lost'
    """
    # Query transaksi dipakai ulang untuk admin maupun member, lalu dibatasi lewat filter opsional.
    query = db.query(Transaction)
    if status:
        query = query.filter(Transaction.status == status)
    if user_id is not None:
        query = query.filter(Transaction.user_id == user_id)
    total = query.count()
    trxs  = query.offset(skip).limit(limit).all()
    return {"total": total, "transactions": trxs}


def get_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
    """Ambil satu transaksi berdasarkan ID."""
    return (
        db.query(Transaction)
        .filter(Transaction.transaction_id == transaction_id)
        .first()
    )


# ============================================================
# CRUD: FINE (DENDA)
# ============================================================

def get_fines(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
    user_id: Optional[int] = None,
) -> dict:
    """
    Ambil daftar denda.
    Filter opsional: status (unpaid, pending_verification, paid, rejected).
    Jika user_id diberikan, hanya kembalikan denda milik user tersebut (untuk member).
    """
    # Join ke tabel transaction dipakai agar filter berdasarkan user bisa diterapkan pada data denda.
    query = db.query(Fine).join(Transaction, Fine.transaction_id == Transaction.transaction_id)
    if status_filter is not None:
        query = query.filter(Fine.status == status_filter)
    if user_id is not None:
        query = query.filter(Transaction.user_id == user_id)
    total = query.count()
    fines = query.offset(skip).limit(limit).all()
    return {"total": total, "fines": fines}


def get_fine(db: Session, fine_id: int) -> Optional[Fine]:
    """Ambil satu denda spesifik."""
    return db.query(Fine).filter(Fine.fine_id == fine_id).first()


def submit_fine_payment(db: Session, fine_id: int, proof_url: str) -> Optional[Fine]:
    """
    Member mengirimkan file bukti pembayaran denda.
    Status berubah menjadi 'pending_verification'.
    """
    fine = get_fine(db, fine_id)
    if not fine:
        return None
    fine.status = "pending_verification"
    fine.payment_proof_url = proof_url
    db.commit()
    db.refresh(fine)
    return fine


def admin_approve_fine(db: Session, fine_id: int) -> Optional[Fine]:
    """Admin mem-verifikasi bukti bayar valid (Lunas)."""
    fine = get_fine(db, fine_id)
    if not fine:
        return None
    fine.status = "paid"
    db.commit()
    db.refresh(fine)
    return fine


def admin_reject_fine(db: Session, fine_id: int, note: str) -> Optional[Fine]:
    """Admin menolak bukti bayar (foto blur, nominal kurang, dll)."""
    fine = get_fine(db, fine_id)
    if not fine:
        return None
    fine.status = "rejected"
    fine.rejection_note = note
    db.commit()
    db.refresh(fine)
    return fine
