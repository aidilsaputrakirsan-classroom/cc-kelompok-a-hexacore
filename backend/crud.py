import hashlib
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from models import Book, Category, Fine, Transaction, User
from schemas import (
    BookCreate, BookUpdate,
    BookStatsResponse,
    CategoryCreate,
    TransactionCreate,
    UserCreate, UserUpdate,
)

# ============================================================
# KONSTANTA
# ============================================================
FINE_PER_DAY = 1_000   # Rp 1.000 per hari keterlambatan


# ============================================================
# HELPER — PASSWORD
# ============================================================
def _hash_password(plain: str) -> str:
    """
    Hash password dengan SHA-256 (sementara).
    CATATAN: Akan diganti dengan bcrypt pada Modul 4 (JWT Auth).
    """
    return hashlib.sha256(plain.encode()).hexdigest()


def _verify_password(plain: str, hashed: str) -> bool:
    """Verifikasi password terhadap hash SHA-256."""
    return hashlib.sha256(plain.encode()).hexdigest() == hashed


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
# CRUD: BOOK
# ============================================================

def create_book(db: Session, data: BookCreate) -> Book:
    """Tambah buku baru ke inventaris."""
    book = Book(
        category_id      = data.category_id,
        isbn             = data.isbn,
        title            = data.title,
        author           = data.author,
        publisher        = data.publisher,
        publication_year = data.publication_year,
        synopsis         = data.synopsis,
        total_stock      = data.total_stock,
        available_stock  = data.available_stock,
    )
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
    query = db.query(Book)
    if search:
        kw = f"%{search}%"
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
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        return None
    user = User(
        email         = data.email,
        password_hash = _hash_password(data.password),
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
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not _verify_password(password, user.password_hash):
        return None
    return user


# ============================================================
# BUSINESS LOGIC: TRANSACTION (BORROW — PENDING)
# ============================================================

def create_transaction(db: Session, data: TransactionCreate) -> Optional[Transaction]:
    """
    Ajukan peminjaman buku (status awal: 'pending').

    Business rules:
    1. Validasi user dan buku ada
    2. Cek available_stock > 0 — jika habis, return None
    3. Stok BELUM dikurangi (menunggu persetujuan admin)
    4. Buat transaksi dengan status 'pending'

    Return:
    - Transaction berstatus 'pending' jika berhasil
    - None jika stok habis
    - Raise ValueError jika user/buku tidak ditemukan
    """
    user = get_user(db, data.user_id)
    if not user:
        raise ValueError(f"User id={data.user_id} tidak ditemukan")

    book = get_book(db, data.book_id)
    if not book:
        raise ValueError(f"Buku id={data.book_id} tidak ditemukan")

    # Cek stok — jika habis, tolak pengajuan
    if book.available_stock <= 0:
        return None   # Caller akan raise HTTP 400

    # Buat transaksi berstatus pending (stok belum berkurang)
    trx = Transaction(
        user_id  = data.user_id,
        book_id  = data.book_id,
        due_date = data.due_date,
        status   = "pending",
    )
    db.add(trx)
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
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status != "pending":
        return None   # Hanya bisa approve yang masih pending

    book = get_book(db, trx.book_id)
    if not book or book.available_stock <= 0:
        return None   # Stok habis saat akan diapprove

    # Kurangi stok baru setelah diapprove
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
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status != "borrowed":
        return None   # Hanya bisa return yang sedang dipinjam

    # Set return_date
    now = datetime.now(timezone.utc)
    trx.return_date = now

    # Increment stok
    book = get_book(db, trx.book_id)
    if book:
        book.available_stock += 1

    # Hitung keterlambatan
    due = trx.due_date
    if due.tzinfo is None:
        due = due.replace(tzinfo=timezone.utc)

    if now > due:
        # Terlambat
        trx.status  = "overdue"
        days_late   = (now - due).days or 1   # minimal 1 hari
        fine_amount = days_late * FINE_PER_DAY

        fine = Fine(
            transaction_id = trx.transaction_id,
            amount         = fine_amount,
            is_paid        = False,
        )
        db.add(fine)
    else:
        trx.status = "returned"

    db.commit()
    db.refresh(trx)
    return trx


def get_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
) -> dict:
    """
    Ambil daftar transaksi dengan filter opsional berdasarkan status.
    Status: 'pending' | 'borrowed' | 'returned' | 'overdue' | 'rejected' | 'lost'
    """
    query = db.query(Transaction)
    if status:
        query = query.filter(Transaction.status == status)
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
    is_paid: Optional[bool] = None,
) -> dict:
    """
    Ambil daftar denda.
    Filter opsional: is_paid=True (lunas) / False (belum lunas).
    """
    query = db.query(Fine)
    if is_paid is not None:
        query = query.filter(Fine.is_paid == is_paid)
    total = query.count()
    fines = query.offset(skip).limit(limit).all()
    return {"total": total, "fines": fines}


def pay_fine(db: Session, fine_id: int) -> Optional[Fine]:
    """Tandai denda sebagai lunas."""
    fine = db.query(Fine).filter(Fine.fine_id == fine_id).first()
    if not fine:
        return None
    fine.is_paid = True
    db.commit()
    db.refresh(fine)
    return fine