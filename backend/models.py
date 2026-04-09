from sqlalchemy import (
    Column, Integer, String, Text, Boolean,
    DateTime, ForeignKey, UniqueConstraint, Table
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base

# File ini mendefinisikan struktur tabel database dan relasi ORM utama backend.
# Model di sini menjadi dasar untuk pembuatan tabel, operasi CRUD, validasi schema,
# dan seluruh alur bisnis yang dipakai oleh main.py, crud.py, dan seeder.py.


# ============================================================
# MODEL 1: User
# ============================================================
class User(Base):
    """
    Tabel users — menyimpan data anggota dan admin perpustakaan.
    Role: 'admin' | 'member'
    """
    __tablename__ = "users"

    # Email menjadi identitas login unik untuk setiap akun.
    user_id       = Column(Integer, primary_key=True, autoincrement=True, index=True)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name     = Column(String(150), nullable=False)
    # Role dipakai oleh layer auth dan endpoint untuk membedakan admin dan member.
    role          = Column(String(10), nullable=False, default="member")  # 'admin' | 'member'
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    # Satu user dapat memiliki banyak riwayat transaksi peminjaman.
    transactions = relationship("Transaction", back_populates="user")

    def __repr__(self):
        return f"<User(user_id={self.user_id}, email='{self.email}', role='{self.role}')>"


# ============================================================
# MODEL 2: Category
# ============================================================
class Category(Base):
    """
    Tabel categories — kategori buku (misal: Fiksi, Sains, Pendidikan).
    PK Integer autoincrement.
    """
    __tablename__ = "categories"

    # Category adalah klasifikasi utama buku, misalnya Fiksi atau Teknologi.
    category_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name        = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    # Relasi one-to-many: satu kategori dapat menaungi banyak buku.
    books = relationship("Book", back_populates="category")

    def __repr__(self):
        return f"<Category(category_id={self.category_id}, name='{self.name}')>"


# ============================================================
# TABEL ASOSIASI: book_genres (Many-to-Many Buku ↔ Genre)
# ============================================================
# Tabel ini menjembatani relasi many-to-many antara Book dan Genre.
# Ini bukan model penuh berbasis class karena hanya menyimpan pasangan relasi.
book_genres = Table(
    "book_genres",
    Base.metadata,
    Column("book_id", Integer, ForeignKey("books.book_id", ondelete="CASCADE"), primary_key=True),
    Column("genre_id", Integer, ForeignKey("genres.genre_id", ondelete="CASCADE"), primary_key=True)
)


# ============================================================
# MODEL 3: Genre
# ============================================================
class Genre(Base):
    """
    Tabel genres — topik/tema spesifik dari isi buku (relasi N-N dengan Buku).
    """
    __tablename__ = "genres"

    # Genre lebih fleksibel dari kategori karena satu buku bisa memiliki banyak genre sekaligus.
    genre_id    = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name        = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    # Relasi many-to-many: satu genre dapat terhubung ke banyak buku, dan sebaliknya.
    books = relationship("Book", secondary=book_genres, back_populates="genres")

    def __repr__(self):
        return f"<Genre(genre_id={self.genre_id}, name='{self.name}')>"


# ============================================================
# MODEL 4: Book
# ============================================================
class Book(Base):
    """
    Tabel books — inventaris buku perpustakaan.
    available_stock selalu <= total_stock.
    """
    __tablename__ = "books"

    book_id          = Column(Integer, primary_key=True, autoincrement=True, index=True)
    category_id      = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    # ISBN bersifat opsional, tetapi harus unik jika diisi.
    isbn             = Column(String(20), unique=True, nullable=True, index=True)
    title            = Column(String(255), nullable=False, index=True)
    author           = Column(String(150), nullable=False)
    publisher        = Column(String(150), nullable=True)
    publication_year = Column(Integer, nullable=True)
    synopsis         = Column(Text, nullable=True)                          # Sinopsis buku
    # total_stock adalah total koleksi fisik, sedangkan available_stock adalah stok yang siap dipinjam.
    total_stock      = Column(Integer, nullable=False, default=1)
    available_stock  = Column(Integer, nullable=False, default=1)

    # Relasi
    # Setiap buku berada tepat pada satu kategori utama.
    category     = relationship("Category", back_populates="books")
    # Buku dapat diberi banyak genre untuk kebutuhan katalog dan filter.
    genres       = relationship("Genre", secondary=book_genres, back_populates="books")
    # Riwayat transaksi menyimpan seluruh proses pinjam/kembali/hilang untuk buku ini.
    transactions = relationship("Transaction", back_populates="book")

    def __repr__(self):
        return (
            f"<Book(book_id={self.book_id}, title='{self.title}', "
            f"available={self.available_stock}/{self.total_stock})>"
        )


# ============================================================
# MODEL 5: Transaction
# ============================================================
class Transaction(Base):
    """
    Tabel transactions — mencatat peminjaman dan pengembalian buku.
    Status: 'pending' | 'borrowed' | 'returned' | 'overdue' | 'rejected' | 'lost'
    """
    __tablename__ = "transactions"

    # Tabel ini menjadi pusat lifecycle peminjaman: diajukan, disetujui, dikembalikan, telat, atau hilang.
    transaction_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    book_id        = Column(Integer, ForeignKey("books.book_id"), nullable=False)
    # borrow_date adalah waktu transaksi dibuat/disetujui, due_date adalah batas kembali, return_date terisi saat buku benar-benar kembali.
    borrow_date    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    due_date       = Column(DateTime(timezone=True), nullable=False)
    return_date    = Column(DateTime(timezone=True), nullable=True)   # Nullable: belum dikembalikan
    # Status dipakai oleh business logic di crud.py untuk menentukan alur transaksi berikutnya.
    status         = Column(
        String(10), nullable=False, default="pending"
    )  # pending | borrowed | returned | overdue | rejected | lost

    # Relasi
    user = relationship("User", back_populates="transactions")
    book = relationship("Book", back_populates="transactions")
    # uselist=False menandakan satu transaksi maksimal hanya memiliki satu denda terkait.
    fine = relationship("Fine", back_populates="transaction", uselist=False)  # 1:1

    def __repr__(self):
        return (
            f"<Transaction(transaction_id={self.transaction_id}, "
            f"status='{self.status}')>"
        )


# ============================================================
# MODEL 6: Fine
# ============================================================
class Fine(Base):
    """
    Tabel fines — denda keterlambatan pengembalian buku.
    Relasi 1:1 dengan Transaction (unique pada transaction_id).
    """
    __tablename__ = "fines"

    fine_id        = Column(Integer, primary_key=True, autoincrement=True, index=True)
    # transaction_id dibuat unik untuk menjaga relasi satu transaksi hanya satu denda.
    transaction_id = Column(
        Integer,
        ForeignKey("transactions.transaction_id"),
        nullable=False,
        unique=True          # 1:1 — satu transaksi hanya bisa punya 1 denda
    )
    # Denda dapat muncul dari keterlambatan pengembalian atau laporan buku hilang.
    amount              = Column(Integer, nullable=False, default=0)   # dalam Rupiah
    # Status dan field bukti pembayaran dipakai dalam alur submit, approve, dan reject pembayaran denda.
    status              = Column(String(25), nullable=False, default="unpaid")
    payment_proof_url   = Column(String(500), nullable=True)   # Lokasi file gambar bukti transfer
    rejection_note      = Column(Text, nullable=True)          # Alasan penolakan dari admin

    # Relasi
    transaction = relationship("Transaction", back_populates="fine")

    def __repr__(self):
        return (
            f"<Fine(fine_id={self.fine_id}, amount={self.amount}, "
            f"status='{self.status}')>"
        )
