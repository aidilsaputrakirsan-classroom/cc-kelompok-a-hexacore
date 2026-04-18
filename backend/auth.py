import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from models import User

load_dotenv()

# File ini menampung helper keamanan backend: hash password, pembuatan token,
# validasi token, dan dependency untuk membatasi akses endpoint.

# Konfigurasi dari environment variables
# Nilai auth dibaca dari environment agar bisa dibedakan antara lokal, Docker, dan production.
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-development")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

# Password hashing
# Context bcrypt dipakai ulang agar seluruh proses hash dan verify konsisten.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Schema autentikasi OAuth2 (sesuai Modul 4)
# tokenUrl mengarah ke endpoint login yang dipakai Swagger dan client untuk meminta access token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ==================== PASSWORD ====================

def hash_password(password: str) -> str:
    """Hash password menggunakan bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifikasi password terhadap hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ==================== JWT TOKEN ====================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Buat JWT access token."""
    # Payload token disalin dulu agar penambahan exp tidak mengubah object asli dari caller.
    to_encode = data.copy()
    # Jika caller tidak memberi durasi khusus, token memakai umur default dari environment.
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode dan verifikasi JWT token."""
    try:
        # Token yang valid akan di-decode dan payload-nya dikembalikan ke dependency caller.
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sudah kadaluarsa, silakan login kembali",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ==================== DEPENDENCY ====================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency injection: ambil current user dari JWT token.
    Gunakan di endpoint yang butuh autentikasi.
    """
    # Tahap 1: token bearer dibaca dari request dan diverifikasi lebih dulu.
    payload = decode_token(token)
    subject = payload.get("sub")
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid, subject missing",
        )

    try:
        user_id: Optional[int] = int(subject)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid, subject tidak sesuai",
        )

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid, subject missing",
        )

    # Tahap 2: subject token dipakai untuk mengambil user aktif dari database.
    user = db.query(User).filter(User.user_id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User tidak ditemukan",
        )

    return user


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency injection lapis kedua: pastikan user yang login adalah admin.
    Gunakan di endpoint yang butuh otoritas mutlak (CRUD referensi & persetujuan denda/transaksi).
    """
    # Dependency lapis kedua ini dipakai saat endpoint hanya boleh diakses oleh admin.
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hak akses ditolak, Anda bukan admin",
        )
    return current_user
