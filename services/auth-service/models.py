from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    """
    Tabel users — menyimpan data anggota dan admin perpustakaan.
    Role: 'admin' | 'member'
    """
    __tablename__ = "users"

    user_id       = Column(Integer, primary_key=True, autoincrement=True, index=True)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name     = Column(String(150), nullable=False)
    role          = Column(String(10), nullable=False, default="member")  # 'admin' | 'member'
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<User(user_id={self.user_id}, email='{self.email}', role='{self.role}')>"
