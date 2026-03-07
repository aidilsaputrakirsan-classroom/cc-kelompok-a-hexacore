import uuid
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


# ============================================================
# USER SCHEMAS
# ============================================================

class UserCreate(BaseModel):
    """Schema untuk mendaftarkan user baru."""
    email     : EmailStr
    password  : str  = Field(..., min_length=8, examples=["password123"])
    full_name : str  = Field(..., min_length=2, max_length=150, examples=["Budi Santoso"])
    role      : str  = Field("member", examples=["member"])   # 'admin' | 'member'


class UserResponse(BaseModel):
    """Schema output user — password tidak pernah dikembalikan."""
    user_id    : uuid.UUID
    email      : str
    full_name  : str
    role       : str
    created_at : datetime

    class Config:
        from_attributes = True


# ============================================================
# CATEGORY SCHEMAS
# ============================================================

class CategoryCreate(BaseModel):
    """Schema untuk membuat kategori buku baru."""
    name        : str           = Field(..., min_length=1, max_length=100, examples=["Fiksi"])
    description : Optional[str] = Field(None, examples=["Buku-buku fiksi dan novel"])


class CategoryResponse(BaseModel):
    """Schema output kategori."""
    category_id : int
    name        : str
    description : Optional[str]

    class Config:
        from_attributes = True


# ============================================================
# BOOK SCHEMAS
# ============================================================

class BookCreate(BaseModel):
    """Schema untuk menambahkan buku baru ke inventaris."""
    category_id      : int
    isbn             : str = Field(..., min_length=10, max_length=20, examples=["978-602-03-3446-5"])
    title            : str = Field(..., min_length=1, max_length=255, examples=["Laskar Pelangi"])
    author           : str = Field(..., min_length=1, max_length=150, examples=["Andrea Hirata"])
    publisher        : Optional[str] = Field(None, examples=["Bentang Pustaka"])
    publication_year : Optional[int] = Field(None, ge=1000, le=2100, examples=[2005])
    total_stock      : int = Field(1, ge=1, examples=[5])
    available_stock  : int = Field(1, ge=0, examples=[5])


class BookUpdate(BaseModel):
    """Schema untuk update data buku — semua field opsional (partial update)."""
    category_id      : Optional[int] = None
    title            : Optional[str] = Field(None, min_length=1, max_length=255)
    author           : Optional[str] = Field(None, min_length=1, max_length=150)
    publisher        : Optional[str] = None
    publication_year : Optional[int] = Field(None, ge=1000, le=2100)
    total_stock      : Optional[int] = Field(None, ge=1)
    available_stock  : Optional[int] = Field(None, ge=0)


class BookResponse(BaseModel):
    """Schema output buku — termasuk info stok real-time."""
    book_id          : uuid.UUID
    category_id      : int
    isbn             : str
    title            : str
    author           : str
    publisher        : Optional[str]
    publication_year : Optional[int]
    total_stock      : int
    available_stock  : int

    class Config:
        from_attributes = True


class BookListResponse(BaseModel):
    """Schema output list buku dengan total count — untuk pagination."""
    total : int
    books : list[BookResponse]


class BookStatsResponse(BaseModel):
    """Schema output statistik inventaris buku."""
    total_titles     : int    # Jumlah judul buku unik
    total_stock      : int    # Total seluruh eksemplar
    available_stock  : int    # Total stok tersedia
    borrowed_count   : int    # Sedang dipinjam
    overdue_count    : int    # Transaksi yang overdue


# ============================================================
# TRANSACTION SCHEMAS
# ============================================================

class TransactionCreate(BaseModel):
    """
    Schema untuk meminjam buku.
    Backend akan otomatis mengisi borrow_date, mengecek stok,
    dan men-decrement available_stock.
    """
    user_id  : uuid.UUID
    book_id  : uuid.UUID
    due_date : datetime = Field(..., examples=["2026-03-18T00:00:00+08:00"])


class TransactionUpdate(BaseModel):
    """
    Schema untuk update status transaksi.
    Digunakan pada endpoint return — backend mengisi return_date otomatis.
    """
    status : str = Field(..., examples=["returned"])  # 'returned' | 'overdue' | 'lost'


class TransactionResponse(BaseModel):
    """Schema output transaksi peminjaman."""
    transaction_id : uuid.UUID
    user_id        : uuid.UUID
    book_id        : uuid.UUID
    borrow_date    : datetime
    due_date       : datetime
    return_date    : Optional[datetime]
    status         : str

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    """Schema output list transaksi dengan total count."""
    total        : int
    transactions : list[TransactionResponse]


# ============================================================
# FINE SCHEMAS
# ============================================================

class FineResponse(BaseModel):
    """Schema output denda keterlambatan."""
    fine_id        : uuid.UUID
    transaction_id : uuid.UUID
    amount         : int    # dalam Rupiah
    is_paid        : bool

    class Config:
        from_attributes = True


class FineListResponse(BaseModel):
    """Schema output list denda."""
    total : int
    fines : list[FineResponse]