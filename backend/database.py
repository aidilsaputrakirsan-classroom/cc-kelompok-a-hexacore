import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# File ini menyiapkan koneksi database, session factory, dan Base ORM
# yang dipakai bersama oleh model, CRUD, auth, dan endpoint backend.

# Load environment variables dari .env
load_dotenv()

# Ambil DATABASE_URL dari environment
# DATABASE_URL menjadi sumber utama koneksi agar konfigurasi mudah dibedakan per environment.
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL tidak ditemukan di .env!")

# Buat engine (koneksi ke database)
# Engine adalah pintu masuk utama SQLAlchemy untuk berbicara ke database target.
engine = create_engine(DATABASE_URL)

# Buat session factory
# SessionLocal dipakai untuk membuat session per request atau per script secara konsisten.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class untuk models
# Semua model ORM akan mewarisi Base ini agar terdaftar pada metadata yang sama.
Base = declarative_base()


# Dependency: dapatkan database session
def get_db():
    """
    Dependency injection untuk FastAPI.
    Membuka session saat request masuk, menutup saat selesai.
    """
    # Dependency ini membuat session baru untuk satu siklus request.
    db = SessionLocal()
    try:
        yield db
    finally:
        # Session selalu ditutup agar koneksi tidak tertinggal setelah request selesai.
        db.close()
