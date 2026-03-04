from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base

# Buat semua tabel di database (jika belum ada)
# Ini akan membuat: users, categories, books, transactions, fines
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LenteraPustaka API",
    description="REST API Sistem Informasi Perpustakaan — Komputasi Awan SI ITK",
    version="0.3.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== HEALTH CHECK ====================

@app.get("/health")
def health_check():
    """Endpoint untuk mengecek apakah API berjalan."""
    return {"status": "healthy", "version": "0.3.0", "app": "LenteraPustaka"}


# ==================== TEAM INFO ====================

@app.get("/team")
def team_info():
    """Informasi tim."""
    return {
        "team": "cloud-team-hexacore",
        "app": "LenteraPustaka",
        "members": [
            {"name": "Maulana Malik Ibrahim", "nim": "10231051", "role": "Lead Backend"},
            {"name": "Micka Mayulia Utama",   "nim": "10231053", "role": "Lead Frontend"},
            {"name": "Khanza Nabila Tsabita", "nim": "10231049", "role": "Lead DevOps"},
            {"name": "Muhammad Aqila Ardhi",  "nim": "10231057", "role": "Lead QA & Docs"},
        ],
    }


# ==================== PLACEHOLDER ====================
# Endpoint CRUD akan ditambahkan setelah schemas.py dan crud.py selesai (Tahap B & C)