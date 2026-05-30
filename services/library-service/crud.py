from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models import Book, Category, Genre, Fine, Transaction
from schemas import (
    BookCreate, BookUpdate, BookStatsResponse,
    CategoryCreate, GenreCreate, TransactionCreate
)

FINE_PER_DAY = 1_000   # Rp 1.000 per hari keterlambatan
LOST_BOOK_FINE = 100_000 # Rp 100.000 denda fix buku hilang


class ConflictError(ValueError):
    """Error bisnis untuk konflik data unik seperti email, nama, atau ISBN."""


# ============================================================
# CRUD: CATEGORY
# ============================================================

def create_category(db: Session, data: CategoryCreate) -> Category:
    """Buat kategori buku baru."""
    category = Category(name=data.name, description=data.description)
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ConflictError("Nama kategori sudah digunakan")
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
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ConflictError("Nama kategori sudah digunakan")
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> bool:
    """Hapus kategori."""
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
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ConflictError("Nama genre sudah digunakan")
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
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ConflictError("Nama genre sudah digunakan")
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
    
    if data.genre_ids:
        genres_query = db.query(Genre).filter(Genre.genre_id.in_(data.genre_ids)).all()
        book.genres.extend(genres_query)

    db.add(book)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ConflictError("ISBN sudah digunakan")
    db.refresh(book)
    return book


def get_books(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
) -> dict:
    """Ambil daftar buku dengan pagination, pencarian, dan filter kategori."""
    query = db.query(Book)
    if category_id is not None:
        query = query.filter(Book.category_id == category_id)
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
    """Update data buku — partial update."""
    book = get_book(db, book_id)
    if not book:
        return None
    update_data = data.model_dump(exclude_unset=True)

    final_total_stock = update_data.get("total_stock", book.total_stock)
    final_available_stock = update_data.get("available_stock", book.available_stock)
    if final_available_stock > final_total_stock:
        raise ValueError("available_stock tidak boleh lebih besar dari total_stock")
    
    if "genre_ids" in update_data:
        genre_ids = update_data.pop("genre_ids")
        if genre_ids is not None:
            new_genres = db.query(Genre).filter(Genre.genre_id.in_(genre_ids)).all()
            book.genres = new_genres
            
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
    """Statistik inventaris buku."""
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
# BUSINESS LOGIC: TRANSACTION (BORROW)
# ============================================================

def create_transaction(db: Session, data: TransactionCreate) -> Optional[Transaction]:
    """
    Ajukan peminjaman buku (status awal: 'pending').
    Pengecekan user eksis dilakukan di level API/main.py.
    """
    # Cek denda aktif
    unpaid_fine = db.query(Fine).join(Transaction).filter(
        Transaction.user_id == data.user_id,
        Fine.status.in_(["unpaid", "pending_verification", "rejected"])
    ).first()
    
    if unpaid_fine:
        raise ValueError("Gagal meminjam: Anda masih memiliki denda yang belum dilunasi. Harap lunasi denda Anda terlebih dahulu.")

    # Cek buku
    book = get_book(db, data.book_id)
    if not book:
        raise ValueError(f"Buku id={data.book_id} tidak ditemukan")

    if book.available_stock <= 0:
        return None

    borrow_date = datetime.now(timezone.utc)
    due_date = borrow_date + timedelta(days=7)

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


def simulate_overdue(db: Session, transaction_id: int, days_late: int = 3) -> Optional[Transaction]:
    """Simulasi buku terlambat dikembalikan."""
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status != "borrowed":
        raise ValueError("Hanya transaksi 'borrowed' yang bisa disimulasikan telat")
    
    now = datetime.now(timezone.utc)
    trx.due_date = now - timedelta(days=days_late)
    
    db.commit()
    db.refresh(trx)
    return trx


def approve_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
    """Admin menyetujui pengajuan peminjaman."""
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status != "pending":
        return None

    book = get_book(db, trx.book_id)
    if not book:
        return None

    if book.available_stock <= 0:
        raise ValueError("Stok buku ini sudah habis — tidak dapat disetujui")

    book.available_stock -= 1
    trx.status = "borrowed"

    db.commit()
    db.refresh(trx)
    return trx


def reject_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
    """Admin menolak pengajuan peminjaman."""
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status != "pending":
        return None

    trx.status = "rejected"
    db.commit()
    db.refresh(trx)
    return trx


def return_book(db: Session, transaction_id: int) -> Optional[Transaction]:
    """Proses pengembalian buku."""
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status != "borrowed":
        return None

    now = datetime.now(timezone.utc)
    trx.return_date = now

    book = get_book(db, trx.book_id)
    if book:
        book.available_stock += 1

    due = trx.due_date
    if due.tzinfo is None:
        due = due.replace(tzinfo=timezone.utc)

    if now > due:
        trx.status  = "overdue"
        days_late   = (now - due).days or 1
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


def report_book_lost(db: Session, transaction_id: int) -> Optional[Transaction]:
    """Proses pelaporan buku hilang (lost)."""
    trx = get_transaction(db, transaction_id)
    if not trx:
        return None
    if trx.status not in ["borrowed", "overdue"]:
        raise ValueError("Hanya buku yang sedang dipinjam (borrowed/overdue) yang bisa dilaporkan hilang.")
    
    book = get_book(db, trx.book_id)
    if book and book.total_stock > 0:
        book.total_stock -= 1
    
    fine = db.query(Fine).filter(Fine.transaction_id == transaction_id).first()
    if fine:
        fine.amount += LOST_BOOK_FINE
        fine.status = "unpaid"
    else:
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
    """Ambil daftar transaksi."""
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
    return db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()


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
    """Ambil daftar denda."""
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
    """Member mengirimkan file bukti pembayaran denda."""
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
    """Admin menolak bukti bayar."""
    fine = get_fine(db, fine_id)
    if not fine:
        return None
    fine.status = "rejected"
    fine.rejection_note = note
    db.commit()
    db.refresh(fine)
    return fine


def get_fine_stats(db: Session) -> dict:
    """Menghitung statistik denda (fines)."""
    from sqlalchemy import func
    
    total_items = db.query(Fine).count()
    total_value = db.query(func.sum(Fine.amount)).scalar() or 0
    termahal = db.query(func.max(Fine.amount)).scalar() or 0
    termurah = db.query(func.min(Fine.amount)).filter(Fine.amount > 0).scalar() or 0
    
    return {
        "total_items": total_items,
        "total_value": total_value,
        "termahal": termahal,
        "termurah": termurah
    }

