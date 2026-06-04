import os
import logging
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, Query, Header, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import User
from schemas import (
    UserCreate, UserUpdate, UserResponse, 
    AdminResetPasswordRequest, MemberChangePasswordRequest, MemberProfileUpdate,
    TokenResponse, TokenVerifyResponse, LoginRequest
)
from auth import (
    create_access_token, get_current_user, get_admin_user, 
    hash_password, verify_password, decode_token
)
import crud
from config import settings
from logging_config import setup_logging
from logging_middleware import RequestLoggingMiddleware

# Setup structured logging
setup_logging()
logger = logging.getLogger(__name__)

# Buat semua tabel di database (jika belum ada)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LenteraPustaka Auth Service",
    description="Authentication and User Management Microservice — Kelompok A (HEXACORE)",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging middleware (setelah CORS)
app.add_middleware(RequestLoggingMiddleware)


@app.on_event("startup")
async def configure_logging():
    """Re-apply structured logging setelah Uvicorn selesai inisialisasi."""
    setup_logging()
    logger.info("LenteraPustaka Auth Service started — structured JSON logging aktif")


def raise_http_from_crud_error(error: ValueError) -> None:
    status_code = 409 if isinstance(error, crud.ConflictError) else 400
    raise HTTPException(status_code=status_code, detail=str(error))


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health", tags=["System"])
@app.get("/auth/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint untuk mengecek status API dan database."""
    health = {
        "status": "healthy",
        "service": "auth-service",
        "app": "LenteraPustaka",
        "version": "1.0.0",
    }
    try:
        db.execute(text("SELECT 1"))
        health["database"] = "connected"
    except Exception as e:
        health["status"] = "unhealthy"
        health["database"] = f"error: {str(e)}"

    status_code = 200 if health["status"] == "healthy" else 503
    return JSONResponse(content=health, status_code=status_code)


# ============================================================
# TEAM INFO
# ============================================================

@app.get("/team", tags=["System"])
def team_info():
    """Informasi tim pengembang."""
    return {
        "team": "cloud-team-hexacore",
        "app":  "LenteraPustaka",
        "members": [
            {"name": "Maulana Malik Ibrahim", "nim": "10231051", "role": "Lead Backend"},
            {"name": "Micka Mayulia Utama",   "nim": "10231053", "role": "Lead Frontend"},
            {"name": "Khanza Nabila Tsabita", "nim": "10231049", "role": "Lead DevOps"},
            {"name": "Muhammad Aqila Ardhi",  "nim": "10231057", "role": "Lead QA & Docs"},
        ],
    }


# ============================================================
# AUTHENTICATION
# ============================================================

@app.post("/auth/register", response_model=UserResponse, status_code=201, tags=["Auth"])
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Registrasi user baru."""
    try:
        user = crud.create_user(db=db, data=user_data)
    except ValueError as e:
        raise_http_from_crud_error(e)
    if not user:
        raise HTTPException(status_code=409, detail="Email sudah terdaftar")
    return user


@app.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user menggunakan skema OAuth2 (Form Data)."""
    user = crud.authenticate_user(db=db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email atau password salah")

    token = create_access_token(data={"sub": str(user.user_id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@app.get("/auth/me", response_model=UserResponse, tags=["Auth"])
def get_me(current_user: User = Depends(get_current_user)):
    """Ambil data profil user yang sedang login."""
    return current_user


@app.put("/auth/me/change-password", response_model=UserResponse, tags=["Auth"])
def change_my_password(data: MemberChangePasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Member mengubah password mereka sendiri; wajib disertai verifikasi password asal."""
    try:
        updated = crud.member_change_password(
            db=db, 
            user_id=current_user.user_id, 
            current_password=data.current_password, 
            new_password=data.new_password
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/auth/me/profile", response_model=UserResponse, tags=["Auth"])
def update_my_profile(data: MemberProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Member hanya bisa mengubah Full Name-nya sendiri."""
    current_user.full_name = data.full_name
    db.commit()
    db.refresh(current_user)
    return current_user


# ============================================================
# TOKEN VERIFICATION (INTER-SERVICE)
# ============================================================

@app.get("/verify", response_model=TokenVerifyResponse, tags=["Auth"])
def verify_token(authorization: str = Header(...), db: Session = Depends(get_db)):
    """
    Verifikasi JWT token — dipanggil oleh library-service secara internal.
    Menerima header: Authorization: Bearer <token>
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Format token salah. Gunakan Bearer <token>")

    token = authorization.split("Bearer ")[1]
    payload = decode_token(token)
    
    subject = payload.get("sub")
    if subject is None:
        raise HTTPException(status_code=401, detail="Token tidak valid, sub missing")
        
    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Token tidak valid, sub tidak valid")

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User tidak ditemukan")

    return TokenVerifyResponse(
        user_id=user.user_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
    )


# ============================================================
# USER MANAGEMENT (ADMIN ONLY)
# ============================================================

@app.get("/users", response_model=list[UserResponse], tags=["Users"])
def list_users(
    skip:  int = Query(0,  ge=0,       description="Offset pagination"),
    limit: int = Query(50, ge=1, le=200, description="Jumlah data"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """Ambil daftar semua user. **Hanya Admin.**"""
    return crud.get_users(db=db, skip=skip, limit=limit)


@app.get("/users/{user_id}", response_model=UserResponse, tags=["Users"])
def get_user_detail(user_id: int, db: Session = Depends(get_db)):
    """
    Ambil detail user berdasarkan ID.
    Dibuat terbuka untuk integrasi internal antar-service.
    """
    user = crud.get_user(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User id={user_id} tidak ditemukan")
    return user


@app.put("/users/{user_id}", response_model=UserResponse, tags=["Users"])
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Update data user. **Hanya Admin.**"""
    try:
        updated = crud.update_user(db=db, user_id=user_id, data=data)
    except ValueError as e:
        raise_http_from_crud_error(e)
    if not updated:
        raise HTTPException(status_code=404, detail=f"User id={user_id} tidak ditemukan")
    return updated


@app.delete("/users/{user_id}", status_code=204, tags=["Users"])
def delete_admin_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Hapus user dari sistem. **Hanya Admin.**"""
    success = crud.delete_user(db=db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"User id={user_id} tidak ditemukan")
    return None


@app.put("/users/{user_id}/reset-password", response_model=UserResponse, tags=["Users"])
def admin_reset_password(user_id: int, data: AdminResetPasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Admin mereset paksa password spesifik user manapun. **Hanya Admin.**"""
    updated = crud.admin_reset_password(db=db, user_id=user_id, new_password=data.new_password)
    if not updated:
        raise HTTPException(status_code=404, detail=f"User id={user_id} tidak ditemukan")
    return updated


@app.get("/metrics", tags=["Monitoring"])
@app.get("/auth/metrics", tags=["Monitoring"])
def get_metrics():
    """Mengembalikan metrik performa aplikasi."""
    from metrics import metrics
    return {
        "service": "auth-service",
        **metrics.get_metrics(),
    }

