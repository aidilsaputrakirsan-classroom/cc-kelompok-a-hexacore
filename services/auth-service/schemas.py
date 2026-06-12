import re
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime

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
    full_name : str = Field(..., min_length=2, max_length=35, examples=["Budi Santoso"])
    role      : str  = Field("member", examples=["member"])   # 'admin' | 'member'

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) > 128:
            raise ValueError('Password tidak boleh lebih dari 128 karakter')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password wajib mengandung minimal 1 huruf besar')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password wajib mengandung minimal 1 huruf kecil')
        if not re.search(r'\d', v):
            raise ValueError('Password wajib mengandung minimal 1 angka')
        if not re.search(r'[@$!%*?&]', v):
            raise ValueError('Password wajib mengandung minimal 1 karakter spesial (@$!%*?&)')
        return v

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 2:
            raise ValueError('Nama lengkap minimal 2 karakter setelah di-strip')
        if len(stripped) > 35:
            raise ValueError('Nama lengkap maksimal 35 karakter setelah di-strip')
        return stripped

class UserUpdate(BaseModel):
    """Schema untuk update data user — semua field opsional (partial update)."""
    email     : Optional[EmailStr] = None
    full_name : Optional[str]      = Field(None, min_length=2, max_length=35)
    role      : Optional[str]      = None   # 'admin' | 'member'

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip()
        if len(stripped) < 2:
            raise ValueError('Nama lengkap minimal 2 karakter setelah di-strip')
        if len(stripped) > 35:
            raise ValueError('Nama lengkap maksimal 35 karakter setelah di-strip')
        return stripped

class MemberProfileUpdate(BaseModel):
    """Schema khusus Member saat ingin mengubah profilnya (Email dan Role terkunci)."""
    full_name: str = Field(..., min_length=2, max_length=35, examples=["Nama Baru"])

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 2:
            raise ValueError('Nama lengkap minimal 2 karakter setelah di-strip')
        if len(stripped) > 35:
            raise ValueError('Nama lengkap maksimal 35 karakter setelah di-strip')
        return stripped

class AdminResetPasswordRequest(BaseModel):
    """Schema untuk Admin saat mereset paksa password user manapun."""
    new_password: str = Field(..., min_length=8, examples=["BaruSekali123!"])

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) > 128:
            raise ValueError('Password tidak boleh lebih dari 128 karakter')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password wajib mengandung minimal 1 huruf besar')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password wajib mengandung minimal 1 huruf kecil')
        if not re.search(r'\d', v):
            raise ValueError('Password wajib mengandung minimal 1 angka')
        if not re.search(r'[@$!%*?&]', v):
            raise ValueError('Password wajib mengandung minimal 1 karakter spesial (@$!%*?&)')
        return v

class MemberChangePasswordRequest(BaseModel):
    """Schema untuk Member saat mengganti passwordnya sendiri."""
    current_password: str = Field(..., description="Password lama/saat ini yang harus diverifikasi")
    new_password: str = Field(..., min_length=8, examples=["GantiLagi123!"])

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) > 128:
            raise ValueError('Password tidak boleh lebih dari 128 karakter')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password wajib mengandung minimal 1 huruf besar')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password wajib mengandung minimal 1 huruf kecil')
        if not re.search(r'\d', v):
            raise ValueError('Password wajib mengandung minimal 1 angka')
        if not re.search(r'[@$!%*?&]', v):
            raise ValueError('Password wajib mengandung minimal 1 karakter spesial (@$!%*?&)')
        return v

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

class TokenVerifyResponse(BaseModel):
    """Schema untuk verifikasi token internal antar-service."""
    user_id: int
    email: str
    full_name: str
    role: str
