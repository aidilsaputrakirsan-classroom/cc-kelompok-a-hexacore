import re
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime


# ============================================================
# USER SCHEMAS
# ============================================================

class UserCreate(BaseModel):
    """Schema untuk mendaftarkan user baru dengan validasi keamanan."""
    email     : EmailStr = Field(
        ...,
        pattern=r"^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]{2,}$",
        description="Format email harus sesuai standar"
    )
    password  : str  = Field(
        ..., 
        min_length=8, 
        examples=["P4ssw0rd!"]
    )
    full_name : str  = Field(..., min_length=2, max_length=150, examples=["Budi Santoso"])
    role      : str  = Field("member", examples=["member"])   # 'admin' | 'member'

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password wajib mengandung minimal 1 huruf besar')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password wajib mengandung minimal 1 huruf kecil')
        if not re.search(r'\d', v):
            raise ValueError('Password wajib mengandung minimal 1 angka')
        if not re.search(r'[@$!%*?&]', v):
            raise ValueError('Password wajib mengandung minimal 1 karakter spesial (@$!%*?&)')
        return v


class UserUpdate(BaseModel):
    """Schema untuk update data user — semua field opsional (partial update)."""
    email     : Optional[EmailStr] = None
    full_name : Optional[str]      = Field(None, min_length=2, max_length=150)
    role      : Optional[str]      = None   # 'admin' | 'member'


class UserResponse(BaseModel):
    """Schema output user — password tidak pernah dikembalikan."""
    user_id    : int
    email      : str
    full_name  : str
    role       : str
    created_at : datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    """Schema request untuk endpoint login."""
    email: EmailStr = Field(..., examples=["budi@student.itk.ac.id"])
    password: str = Field(..., examples=["P4ssw0rd!"])

class TokenResponse(BaseModel):
    """Schema untuk JWT access_token saat login sukses."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


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
# GENRE SCHEMAS
# ============================================================

class GenreCreate(BaseModel):
    """Schema untuk membuat genre buku baru."""
    name        : str           = Field(..., min_length=1, max_length=100, examples=["Horor"])
    description : Optional[str] = Field(None, examples=["Cerita yang menakutkan"])

class GenreResponse(BaseModel):
    """Schema output genre."""
    genre_id    : int
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
    genre_ids        : list[int]     = Field(default_factory=list, description="List ID Genre buku")
    isbn             : Optional[str] = Field(None, min_length=10, max_length=20, examples=["978-602-03-3446-5"])
    title            : str           = Field(..., min_length=1, max_length=255, examples=["Laskar Pelangi"])
    author           : str           = Field(..., min_length=1, max_length=150, examples=["Andrea Hirata"])
    publisher        : Optional[str] = Field(None, examples=["Bentang Pustaka"])
    publication_year : Optional[int] = Field(None, ge=1000, le=2100, examples=[2005])
    synopsis         : Optional[str] = Field(None, examples=["Novel tentang semangat anak-anak Belitung..."])
    total_stock      : int           = Field(1, ge=1, examples=[5])
    available_stock  : int           = Field(1, ge=0, examples=[5])


class BookUpdate(BaseModel):
    """Schema untuk update data buku — semua field opsional (partial update)."""
    category_id      : Optional[int] = None
    genre_ids        : Optional[list[int]] = Field(None, description="Ganti seluruh relasi genre buku ini")
    title            : Optional[str] = Field(None, min_length=1, max_length=255)
    author           : Optional[str] = Field(None, min_length=1, max_length=150)
    publisher        : Optional[str] = None
    publication_year : Optional[int] = Field(None, ge=1000, le=2100)
    synopsis         : Optional[str] = None
    total_stock      : Optional[int] = Field(None, ge=1)
    available_stock  : Optional[int] = Field(None, ge=0)


class BookResponse(BaseModel):
    """Schema output buku — termasuk info stok real-time."""
    book_id          : int
    category_id      : int
    genres           : list[GenreResponse] = []
    isbn             : Optional[str]
    title            : str
    author           : str
    publisher        : Optional[str]
    publication_year : Optional[int]
    synopsis         : Optional[str]
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
    Schema untuk mengajukan peminjaman buku.
    Status awal otomatis 'pending' — menunggu verifikasi admin.
    """
    user_id  : int
    book_id  : int
    due_date : datetime = Field(..., examples=["2026-03-18T00:00:00+08:00"])


class TransactionUpdate(BaseModel):
    """Schema untuk update status transaksi secara manual."""
    status : str = Field(..., examples=["returned"])


class TransactionResponse(BaseModel):
    """Schema output transaksi peminjaman."""
    transaction_id : int
    user_id        : int
    book_id        : int
    borrow_date    : datetime
    due_date       : datetime
    return_date    : Optional[datetime]
    status         : str   # pending | borrowed | returned | overdue | rejected | lost

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
    fine_id        : int
    transaction_id : int
    amount         : int    # dalam Rupiah
    is_paid        : bool

    class Config:
        from_attributes = True


class FineListResponse(BaseModel):
    """Schema output list denda."""
    total : int
    fines : list[FineResponse]