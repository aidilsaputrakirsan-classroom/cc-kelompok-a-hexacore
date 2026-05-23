from sqlalchemy import (
    Column, Integer, String, Text,
    DateTime, ForeignKey, Table, Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base

# Tabel asosiasi many-to-many antara Book dan Genre
book_genres = Table(
    "book_genres",
    Base.metadata,
    Column("book_id", Integer, ForeignKey("books.book_id", ondelete="CASCADE"), primary_key=True),
    Column("genre_id", Integer, ForeignKey("genres.genre_id", ondelete="CASCADE"), primary_key=True)
)


class Category(Base):
    """Tabel categories — kategori buku (misal: Fiksi, Sains, Pendidikan)."""
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name        = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    books = relationship("Book", back_populates="category")

    def __repr__(self):
        return f"<Category(category_id={self.category_id}, name='{self.name}')>"


class Genre(Base):
    """Tabel genres — topik/tema spesifik dari isi buku."""
    __tablename__ = "genres"

    genre_id    = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name        = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    books = relationship("Book", secondary=book_genres, back_populates="genres")

    def __repr__(self):
        return f"<Genre(genre_id={self.genre_id}, name='{self.name}')>"


class Book(Base):
    """Tabel books — inventaris buku perpustakaan."""
    __tablename__ = "books"

    book_id          = Column(Integer, primary_key=True, autoincrement=True, index=True)
    category_id      = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    isbn             = Column(String(20), unique=True, nullable=True, index=True)
    title            = Column(String(255), nullable=False, index=True)
    author           = Column(String(150), nullable=False)
    publisher        = Column(String(150), nullable=True)
    publication_year = Column(Integer, nullable=True)
    synopsis         = Column(Text, nullable=True)
    cover_image_url  = Column(String(500), nullable=True)
    total_stock      = Column(Integer, nullable=False, default=1)
    available_stock  = Column(Integer, nullable=False, default=1)

    category     = relationship("Category", back_populates="books")
    genres       = relationship("Genre", secondary=book_genres, back_populates="books")
    transactions = relationship("Transaction", back_populates="book")

    def __repr__(self):
        return (
            f"<Book(book_id={self.book_id}, title='{self.title}', "
            f"available={self.available_stock}/{self.total_stock})>"
        )


class Transaction(Base):
    """
    Tabel transactions — mencatat peminjaman dan pengembalian buku.
    Catatan: Hubungan ke user dijaga menggunakan logical user_id (tanpa ForeignKey fisik).
    Status: 'pending' | 'borrowed' | 'returned' | 'overdue' | 'rejected' | 'lost'
    """
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id        = Column(Integer, nullable=False, index=True) # Logical Reference ke user di auth_db
    book_id        = Column(Integer, ForeignKey("books.book_id"), nullable=False)
    borrow_date    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    due_date       = Column(DateTime(timezone=True), nullable=False)
    return_date    = Column(DateTime(timezone=True), nullable=True)
    status         = Column(String(10), nullable=False, default="pending")  # pending | borrowed | returned | overdue | rejected | lost

    book = relationship("Book", back_populates="transactions")
    fine = relationship("Fine", back_populates="transaction", uselist=False)  # 1:1

    def __repr__(self):
        return (
            f"<Transaction(transaction_id={self.transaction_id}, "
            f"status='{self.status}')>"
        )


class Fine(Base):
    """
    Tabel fines — denda keterlambatan pengembalian buku.
    Relasi 1:1 dengan Transaction.
    """
    __tablename__ = "fines"

    fine_id        = Column(Integer, primary_key=True, autoincrement=True, index=True)
    transaction_id = Column(
        Integer,
        ForeignKey("transactions.transaction_id"),
        nullable=False,
        unique=True
    )
    amount              = Column(Integer, nullable=False, default=0)   # dalam Rupiah
    status              = Column(String(25), nullable=False, default="unpaid")
    payment_proof_url   = Column(String(500), nullable=True)
    rejection_note      = Column(Text, nullable=True)

    transaction = relationship("Transaction", back_populates="fine")

    def __repr__(self):
        return (
            f"<Fine(fine_id={self.fine_id}, amount={self.amount}, "
            f"status='{self.status}')>"
        )
