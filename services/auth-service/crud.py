from typing import Optional
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models import User
from schemas import UserCreate, UserUpdate
from auth import hash_password, verify_password

class ConflictError(ValueError):
    """Error bisnis untuk konflik data unik seperti email."""


def create_user(db: Session, data: UserCreate) -> Optional[User]:
    """Daftarkan user baru."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        return None
    user = User(
        email         = data.email,
        password_hash = hash_password(data.password),
        full_name     = data.full_name,
        role          = data.role,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ConflictError("Email sudah terdaftar")
    db.refresh(user)
    return user


def get_users(db: Session, skip: int = 0, limit: int = 50) -> list[User]:
    """Ambil semua user."""
    return db.query(User).offset(skip).limit(limit).all()


def get_user(db: Session, user_id: int) -> Optional[User]:
    """Ambil satu user berdasarkan ID."""
    return db.query(User).filter(User.user_id == user_id).first()


def update_user(db: Session, user_id: int, data: UserUpdate) -> Optional[User]:
    """Update data user."""
    user = get_user(db, user_id)
    if not user:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ConflictError("Email sudah terdaftar")
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    """Hapus user dari sistem."""
    user = get_user(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Autentikasi user: cek email & password."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def admin_reset_password(db: Session, user_id: int, new_password: str) -> Optional[User]:
    """Admin mereset paksa password user manapun."""
    user = get_user(db, user_id)
    if not user:
        return None
    user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user


def member_change_password(db: Session, user_id: int, current_password: str, new_password: str) -> Optional[User]:
    """Member ganti sandi sendiri."""
    user = get_user(db, user_id)
    if not user:
        return None
    if not verify_password(current_password, user.password_hash):
        raise ValueError("Password saat ini tidak cocok dengan database")
    user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user
