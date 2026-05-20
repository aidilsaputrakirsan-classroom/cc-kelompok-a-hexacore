import re
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime

# ============================================================
# USER SCHEMAS (NESTED / LOGICAL)
# ============================================================

class UserResponse(BaseModel):
    """Schema output user untuk di-nest di dalam transaksi."""
    user_id    : int
    email      : str
    full_name  : str
    role       : str

    class Config:
        from_attributes = True


# ============================================================
# CATEGORY SCHEMAS
# ============================================================

class CategoryCreate(BaseModel):
    name        : str           = Field(..., min_length=1, max_length=100, examples=["Fiksi"])
    description : Optional[str] = Field(None, examples=["Buku-buku fiksi dan novel"])


class CategoryResponse(BaseModel):
    category_id : int
    name        : str
    description : Optional[str]

    class Config:
        from_attributes = True


# ============================================================
# GENRE SCHEMAS
# ============================================================

class GenreCreate(BaseModel):
    name        : str           = Field(..., min_length=1, max_length=100, examples=["Horor"])
    description : Optional[str] = Field(None, examples=["Cerita yang menakutkan"])


class GenreResponse(BaseModel):
    genre_id    : int
    name        : str
    description : Optional[str]

    class Config:
        from_attributes = True


# ============================================================
# BOOK SCHEMAS
# ============================================================

class BookCreate(BaseModel):
    category_id      : int
    genre_ids        : list[int]     = Field(default_factory=list, description="List ID Genre buku")
    isbn             : Optional[str] = Field(None, min_length=10, max_length=20, examples=["978-602-03-3446-5"])
    title            : str           = Field(..., min_length=1, max_length=255, examples=["Laskar Pelangi"])
    author           : str           = Field(..., min_length=1, max_length=150, examples=["Andrea Hirata"])
    publisher        : Optional[str] = Field(None, examples=["Bentang Pustaka"])
    publication_year : Optional[int] = Field(None, ge=1000, le=2100, examples=[2005])
    synopsis         : Optional[str] = Field(None, examples=["Novel tentang semangat anak-anak Belitung..."])
    cover_image_url  : Optional[str] = Field(None, description="URL cover buku yang dapat diakses publik")
    total_stock      : int           = Field(1, ge=1, examples=[5])
    available_stock  : int           = Field(1, ge=0, examples=[5])

    @field_validator("isbn")
    @classmethod
    def validate_isbn_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        value = v.strip()
        if not value:
            return None
        if not re.fullmatch(r"[0-9-]+", value):
            raise ValueError("ISBN hanya boleh berisi angka dan strip (-)")
        if "-" not in value:
            raise ValueError("ISBN wajib menggunakan format angka + strip (-)")
        return value

    @model_validator(mode="after")
    def validate_stock_consistency(self):
        if self.available_stock > self.total_stock:
            raise ValueError("available_stock tidak boleh lebih besar dari total_stock")
        return self


class BookUpdate(BaseModel):
    category_id      : Optional[int] = None
    genre_ids        : Optional[list[int]] = Field(None, description="Ganti seluruh relasi genre buku ini")
    title            : Optional[str] = Field(None, min_length=1, max_length=255)
    author           : Optional[str] = Field(None, min_length=1, max_length=150)
    publisher        : Optional[str] = None
    publication_year : Optional[int] = Field(None, ge=1000, le=2100)
    synopsis         : Optional[str] = None
    cover_image_url  : Optional[str] = None
    total_stock      : Optional[int] = Field(None, ge=1)
    available_stock  : Optional[int] = Field(None, ge=0)

    @model_validator(mode="after")
    def validate_stock_consistency_when_both_present(self):
        if self.total_stock is not None and self.available_stock is not None:
            if self.available_stock > self.total_stock:
                raise ValueError("available_stock tidak boleh lebih besar dari total_stock")
        return self


class BookResponse(BaseModel):
    book_id          : int
    category_id      : int
    genres           : list[GenreResponse] = []
    isbn             : Optional[str]
    title            : str
    author           : str
    publisher        : Optional[str]
    publication_year : Optional[int]
    synopsis         : Optional[str]
    cover_image_url  : Optional[str]
    total_stock      : int
    available_stock  : int

    class Config:
        from_attributes = True


class BookListResponse(BaseModel):
    total : int
    books : list[BookResponse]


class BookStatsResponse(BaseModel):
    total_titles     : int
    total_stock      : int
    available_stock  : int
    borrowed_count   : int
    overdue_count    : int


# ============================================================
# TRANSACTION SCHEMAS
# ============================================================

class TransactionCreate(BaseModel):
    user_id  : int
    book_id  : int


class TransactionUpdate(BaseModel):
    status : str = Field(..., examples=["returned"])


class TransactionResponse(BaseModel):
    transaction_id : int
    user_id        : int
    book_id        : int
    borrow_date    : datetime
    due_date       : datetime
    return_date    : Optional[datetime]
    status         : str   # pending | borrowed | returned | overdue | rejected | lost

    book           : Optional[BookResponse] = None
    user           : Optional[UserResponse] = None

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    total        : int
    transactions : list[TransactionResponse]


# ============================================================
# FINE SCHEMAS
# ============================================================

class FineResponse(BaseModel):
    fine_id           : int
    transaction_id    : int
    amount            : int    # dalam Rupiah
    status            : str    # unpaid | pending_verification | paid | rejected
    payment_proof_url : Optional[str] = None
    rejection_note    : Optional[str] = None

    class Config:
        from_attributes = True


class FinePaymentSubmit(BaseModel):
    payment_proof_url: str = Field(..., description="URL gambar bukti transfer")


class FineRejectRequest(BaseModel):
    rejection_note    : str = Field(..., description="Alasan mengapa bukti ditolak")


class FineListResponse(BaseModel):
    total : int
    fines : list[FineResponse]
