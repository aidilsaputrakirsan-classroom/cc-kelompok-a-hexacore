import uuid
from sqlalchemy import (
    Column, Integer, String, Text, Boolean,
    DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


# ============================================================
# MODEL 1: User
# ============================================================
class User(Base):
    """
    Tabel users — menyimpan data anggota dan admin perpustakaan.
    Role: 'admin' atau 'member'
    """
    __tablename__ = "users"

    user_id     = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email       = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name   = Column(String(150), nullable=False)
    role        = Column(String(10), nullable=False, default="member")  # 'admin' | 'member'
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    # Relasi: satu user bisa punya banyak transaksi
    transactions = relationship("Transaction", back_populates="user")

    def __repr__(self):
        return f"<User(user_id={self.user_id}, email='{self.email}', role='{self.role}')>"


# ============================================================
# MODEL 2: Category
# ============================================================
class Category(Base):
    """
    Tabel categories — kategori buku (misal: Fiksi, Sains, Pendidikan).
    PK Integer (bukan UUID) sesuai ERD.
    """
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name        = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    # Relasi: satu kategori bisa punya banyak buku
    books = relationship("Book", back_populates="category")

    def __repr__(self):
        return f"<Category(category_id={self.category_id}, name='{self.name}')>"


# ============================================================
# MODEL 3: Book
# ============================================================
class Book(Base):
    """
    Tabel books — inventaris buku perpustakaan.
    available_stock selalu <= total_stock.
    """
    __tablename__ = "books"

    book_id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    category_id      = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    isbn             = Column(String(20), unique=True, nullable=True, index=True) 
    title            = Column(String(255), nullable=False, index=True)
    author           = Column(String(150), nullable=False)
    publisher        = Column(String(150), nullable=True)
    publication_year = Column(Integer, nullable=True)
    total_stock      = Column(Integer, nullable=False, default=1)
    available_stock  = Column(Integer, nullable=False, default=1)

    # Relasi
    category     = relationship("Category", back_populates="books")
    transactions = relationship("Transaction", back_populates="book")

    def __repr__(self):
        return (
            f"<Book(book_id={self.book_id}, title='{self.title}', "
            f"available={self.available_stock}/{self.total_stock})>"
        )


# ============================================================
# MODEL 4: Transaction
# ============================================================
class Transaction(Base):
    """
    Tabel transactions — mencatat peminjaman dan pengembalian buku.
    Status: 'borrowed' | 'returned' | 'overdue' | 'lost'
    """
    __tablename__ = "transactions"

    transaction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id        = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    book_id        = Column(UUID(as_uuid=True), ForeignKey("books.book_id"), nullable=False)
    borrow_date    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    due_date       = Column(DateTime(timezone=True), nullable=False)
    return_date    = Column(DateTime(timezone=True), nullable=True)   # Nullable: belum dikembalikan
    status         = Column(String(10), nullable=False, default="borrowed")  # borrowed|returned|overdue|lost

    # Relasi
    user = relationship("User", back_populates="transactions")
    book = relationship("Book", back_populates="transactions")
    fine = relationship("Fine", back_populates="transaction", uselist=False)  # 1:1

    def __repr__(self):
        return (
            f"<Transaction(transaction_id={self.transaction_id}, "
            f"status='{self.status}')>"
        )


# ============================================================
# MODEL 5: Fine
# ============================================================
class Fine(Base):
    """
    Tabel fines — denda keterlambatan pengembalian buku.
    Relasi 1:1 dengan Transaction (UniqueConstraint pada transaction_id).
    """
    __tablename__ = "fines"

    fine_id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    transaction_id = Column(
        UUID(as_uuid=True),
        ForeignKey("transactions.transaction_id"),
        nullable=False,
        unique=True          # 1:1 — satu transaksi hanya bisa punya 1 denda
    )
    amount   = Column(Integer, nullable=False, default=0)   # dalam Rupiah
    is_paid  = Column(Boolean, nullable=False, default=False)

    # Relasi
    transaction = relationship("Transaction", back_populates="fine")

    def __repr__(self):
        return (
            f"<Fine(fine_id={self.fine_id}, amount={self.amount}, "
            f"is_paid={self.is_paid})>"
        )