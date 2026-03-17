import os
from dotenv import load_dotenv

import uuid
from fastapi import FastAPI, Depends, HTTPException, Query, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base
from schemas import (
    # Category & Genre
    CategoryCreate, CategoryResponse,
    GenreCreate, GenreResponse,
    # Book
    BookCreate, BookUpdate, BookResponse, BookListResponse, BookStatsResponse,
    # User
    UserCreate, UserUpdate, UserResponse, AdminResetPasswordRequest, MemberChangePasswordRequest, MemberProfileUpdate,
    # Auth
    LoginRequest, TokenResponse,
    # Transaction
    TransactionCreate, TransactionUpdate, TransactionResponse, TransactionListResponse,
    # Fine
    FineResponse, FineListResponse, FinePaymentSubmit, FineRejectRequest,
)
from auth import create_access_token, get_current_user, get_admin_user
from models import User
import crud

load_dotenv()

# Buat semua tabel di database (jika belum ada)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LenteraPustaka API",
    description=(
        "REST API Sistem Informasi Perpustakaan — Komputasi Awan SI ITK\n\n"
        "Kelompok A (HEXACORE)\n"
        "**Arsitektur:** 5-file Separation of Concerns "
        "(database.py → models.py → schemas.py → crud.py → main.py)"
    ),
    version="0.4.0",
)

# ==================== STATIC FILES ====================
# Pastikan folder static/fines ada
os.makedirs("static/fines", exist_ok=True)

# Mount folder static agar bisa diakses via URL /static
app.mount("/static", StaticFiles(directory="static"), name="static")

# ==================== CORS ====================
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins_list = [o.strip() for o in allowed_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# UPLOAD (HELPER)
# ============================================================

@app.post("/upload/fines", tags=["Upload"])
async def upload_fine_proof(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """
    Upload bukti pembayaran denda (Image only).
    File akan disimpan di folder 'static/fines'.
    Return: URL file yang bisa diakses publik.
    """
    # Validasi tipe file (hanya gambar)
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar (jpg, png, jpeg)")

    # Buat nama file unik agar tidak tertimpa
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = f"static/fines/{unique_filename}"

    # Simpan file ke disk
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan file: {str(e)}")

    # Kembalikan URL lengkap (sesuaikan dengan domain/IP server nanti)
    # Untuk local dev & docker, path relatif '/static/...' sudah cukup jika frontend pintar handle base URL,
    # tapi agar aman kita kembalikan path absolut dari root server.
    return {"url": f"/static/fines/{unique_filename}"}


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health", tags=["System"])
def health_check():
    """Cek apakah API berjalan."""
    return {"status": "healthy", "version": "0.4.0", "app": "LenteraPustaka"}


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
    user = crud.create_user(db=db, data=user_data)
    if not user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    return user


@app.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login user menggunakan skema OAuth2 (Form Data).
    Fungsi ini dipakai juga oleh tombol 'Authorize' (Gembok) di Swagger UI.
    - **username**: isi dengan email user
    - **password**: password user
    """
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
    """Member hanya bisa mengubah Full Name/Username-nya sendiri."""
    current_user.full_name = data.full_name
    db.commit()
    db.refresh(current_user)
    return current_user

# ============================================================
# CATEGORIES
# ============================================================

@app.post("/categories", response_model=CategoryResponse, status_code=201, tags=["Categories"])
def create_category(data: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Tambah kategori buku baru."""
    return crud.create_category(db=db, data=data)


@app.get("/categories", response_model=list[CategoryResponse], tags=["Categories"])
def list_categories(
    skip:  int = Query(0,   ge=0,  description="Offset pagination"),
    limit: int = Query(100, ge=1, le=200, description="Jumlah data"),
    db: Session = Depends(get_db)
):
    """Ambil semua kategori buku."""
    return crud.get_categories(db=db, skip=skip, limit=limit)


@app.get("/categories/{category_id}", response_model=CategoryResponse, tags=["Categories"])
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Ambil satu kategori berdasarkan ID."""
    category = crud.get_category(db=db, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail=f"Kategori id={category_id} tidak ditemukan")
    return category


@app.put("/categories/{category_id}", response_model=CategoryResponse, tags=["Categories"])
def update_category(category_id: int, data: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Update nama dan deskripsi kategori."""
    updated = crud.update_category(db=db, category_id=category_id, data=data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Kategori id={category_id} tidak ditemukan")
    return updated


@app.delete("/categories/{category_id}", status_code=204, tags=["Categories"])
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Hapus kategori."""
    success = crud.delete_category(db=db, category_id=category_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Kategori id={category_id} tidak ditemukan")
    return None


# ============================================================
# GENRES
# ============================================================

@app.post("/genres", response_model=GenreResponse, status_code=201, tags=["Genres"])
def create_genre(data: GenreCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Tambah genre buku baru."""
    return crud.create_genre(db=db, data=data)


@app.get("/genres", response_model=list[GenreResponse], tags=["Genres"])
def list_genres(
    skip:  int = Query(0,   ge=0,  description="Offset pagination"),
    limit: int = Query(100, ge=1, le=200, description="Jumlah data"),
    db: Session = Depends(get_db)
):
    """Ambil semua genre (untuk opsi filter dropdown)."""
    return crud.get_genres(db=db, skip=skip, limit=limit)


@app.get("/genres/{genre_id}", response_model=GenreResponse, tags=["Genres"])
def get_genre(genre_id: int, db: Session = Depends(get_db)):
    """Ambil satu genre berdasarkan ID."""
    genre = crud.get_genre(db=db, genre_id=genre_id)
    if not genre:
        raise HTTPException(status_code=404, detail=f"Genre id={genre_id} tidak ditemukan")
    return genre


@app.put("/genres/{genre_id}", response_model=GenreResponse, tags=["Genres"])
def update_genre(genre_id: int, data: GenreCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Update nama dan deskripsi genre."""
    updated = crud.update_genre(db=db, genre_id=genre_id, data=data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Genre id={genre_id} tidak ditemukan")
    return updated


@app.delete("/genres/{genre_id}", status_code=204, tags=["Genres"])
def delete_genre(genre_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Hapus genre."""
    success = crud.delete_genre(db=db, genre_id=genre_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Genre id={genre_id} tidak ditemukan")
    return None


# ============================================================
# BOOKS
# ⚠️  GET /books/stats HARUS sebelum GET /books/{book_id}
#     agar FastAPI tidak salah parse 'stats' sebagai integer
# ============================================================

@app.post("/books", response_model=BookResponse, status_code=201, tags=["Books"])
def create_book(data: BookCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """
    Tambah buku baru ke inventaris.

    - **isbn**: Opsional, harus unik jika diisi
    - **synopsis**: Ringkasan/sinopsis buku (opsional)
    - **total_stock** & **available_stock**: Jumlah eksemplar
    - **category_id**: ID kategori harus sudah ada
    """
    return crud.create_book(db=db, data=data)


@app.get("/books", response_model=BookListResponse, tags=["Books"])
def list_books(
  skip:   int        = Query(0,    ge=0,       description="Offset pagination"),
    limit:  int        = Query(20,   ge=1, le=100, description="Jumlah data per halaman"),
    search: str | None = Query(None,             description="Cari berdasarkan judul, pengarang, atau ISBN"),
    db: Session = Depends(get_db)
):
    """Ambil daftar buku dengan pagination dan pencarian."""
    return crud.get_books(db=db, skip=skip, limit=limit, search=search)


@app.get("/books/stats", response_model=BookStatsResponse, tags=["Books"])
def get_book_stats(db: Session = Depends(get_db)):
    """
    Statistik inventaris buku.

    - **total_titles**: Jumlah judul buku unik
    - **total_stock**: Total seluruh eksemplar
    - **available_stock**: Stok tersedia saat ini
    - **borrowed_count**: Sedang dipinjam
    - **overdue_count**: Terlambat dikembalikan
    """
    return crud.get_book_stats(db=db)


@app.get("/books/{book_id}", response_model=BookResponse, tags=["Books"])
def get_book(book_id: int, db: Session = Depends(get_db)):
    """Ambil detail satu buku berdasarkan ID."""
    book = crud.get_book(db=db, book_id=book_id)
    if not book:
        raise HTTPException(status_code=404, detail=f"Buku id={book_id} tidak ditemukan")
    return book


@app.put("/books/{book_id}", response_model=BookResponse, tags=["Books"])
def update_book(book_id: int, data: BookUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """
    Update data buku — partial update, hanya field yang dikirim yang berubah.
    ISBN tidak bisa diubah (gunakan DELETE + POST jika perlu).
    """
    updated = crud.update_book(db=db, book_id=book_id, data=data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Buku id={book_id} tidak ditemukan")
    return updated


@app.delete("/books/{book_id}", status_code=204, tags=["Books"])
def delete_book(book_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Hapus buku dari inventaris."""
    success = crud.delete_book(db=db, book_id=book_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Buku id={book_id} tidak ditemukan")
    return None


# ============================================================
# USERS
# ============================================================

@app.post("/users", response_model=UserResponse, status_code=201, tags=["Users"], deprecated=True)
def create_user_old(data: UserCreate, db: Session = Depends(get_db)):
    """
    Daftarkan user baru (DEPRECATED, silakan gunakan /auth/register).
    """
    user = crud.create_user(db=db, data=data)
    if not user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    return user


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
def get_user_detail(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Ambil detail user. Admin bisa lihat siapa saja; Member hanya bisa lihat profilnya sendiri."""
    if current_user.role != "admin" and current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak: Anda hanya dapat melihat profil Anda sendiri")
    user = crud.get_user(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User id={user_id} tidak ditemukan")
    return user


@app.put("/users/{user_id}", response_model=UserResponse, tags=["Users"])
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """
    Update data user — partial update, hanya field yang dikirim yang berubah.
    Dapat digunakan admin untuk mengubah role, nama, atau email user.
    """
    updated = crud.update_user(db=db, user_id=user_id, data=data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"User id={user_id} tidak ditemukan")
    return updated


@app.delete("/users/{user_id}", status_code=204, tags=["Users"])
def delete_admin_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Hapus user dari sistem."""
    success = crud.delete_user(db=db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"User id={user_id} tidak ditemukan")
    return None

@app.put("/users/{user_id}/reset-password", response_model=UserResponse, tags=["Users"])
def admin_reset_password(user_id: int, data: AdminResetPasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Admin mereset paksa password spesifik user manapun tanpa proteksi gembok lama."""
    updated = crud.admin_reset_password(db=db, user_id=user_id, new_password=data.new_password)
    if not updated:
        raise HTTPException(status_code=404, detail=f"User id={user_id} tidak ditemukan")
    return updated

# ============================================================
# TRANSACTIONS (BORROW & RETURN)
# ============================================================

@app.post("/transactions", response_model=TransactionResponse, status_code=201, tags=["Transactions"])
def borrow_book(data: TransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Ajukan peminjaman buku (status awal: 'pending').

    Business rules:
    - Member hanya dapat mengajukan peminjaman atas nama dirinya sendiri
    - Stok tersedia harus > 0
    - Stok belum dikurangi — menunggu persetujuan admin
    - Gunakan `PUT /transactions/{id}/approve` untuk menyetujui
    """
    if current_user.role != "admin" and data.user_id != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="Akses ditolak: Member hanya dapat mengajukan peminjaman atas nama dirinya sendiri",
        )
    try:
        trx = crud.create_transaction(db=db, data=data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    if trx is None:
        raise HTTPException(
            status_code=400,
            detail="Stok buku habis — tidak tersedia untuk dipinjam saat ini",
        )
    return trx


@app.put("/transactions/{transaction_id}/approve", response_model=TransactionResponse, tags=["Transactions"])
def approve_transaction_admin(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """
    Admin menyetujui pengajuan peminjaman (pending → borrowed).

    - Stok buku otomatis berkurang 1 setelah disetujui
    - Hanya transaksi berstatus 'pending' yang bisa di-approve
    """
    try:
        trx = crud.approve_transaction(db=db, transaction_id=transaction_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not trx:
        raise HTTPException(
            status_code=404,
            detail=f"Transaksi id={transaction_id} tidak ditemukan atau bukan berstatus 'pending'",
        )
    return trx


@app.put("/transactions/{transaction_id}/reject", response_model=TransactionResponse, tags=["Transactions"])
def reject_transaction_admin(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """
    Admin menolak pengajuan peminjaman (pending → rejected).

    - Stok buku tidak berubah
    - Hanya transaksi berstatus 'pending' yang bisa di-reject
    """
    trx = crud.reject_transaction(db=db, transaction_id=transaction_id)
    if not trx:
        raise HTTPException(
            status_code=404,
            detail=f"Transaksi id={transaction_id} tidak ditemukan atau bukan berstatus 'pending'",
        )
    return trx


@app.get("/transactions", response_model=TransactionListResponse, tags=["Transactions"])
def list_transactions(
    skip:   int        = Query(0,    ge=0,       description="Offset pagination"),
    limit:  int        = Query(20,   ge=1, le=100, description="Jumlah data per halaman"),
    status: str | None = Query(None,             description="Filter status: pending | borrowed | returned | overdue | rejected | lost"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil daftar transaksi. Admin melihat semua; Member hanya melihat transaksi miliknya."""
    user_id_filter = None if current_user.role == "admin" else current_user.user_id
    return crud.get_transactions(db=db, skip=skip, limit=limit, status=status, user_id=user_id_filter)


@app.get("/transactions/{transaction_id}", response_model=TransactionResponse, tags=["Transactions"])
def get_transaction_detail(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Ambil detail transaksi. Admin bisa lihat semua; Member hanya bisa lihat miliknya."""
    trx = crud.get_transaction(db=db, transaction_id=transaction_id)
    if not trx:
        raise HTTPException(status_code=404, detail=f"Transaksi id={transaction_id} tidak ditemukan")
    if current_user.role != "admin" and trx.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak: Anda hanya dapat melihat transaksi milik Anda sendiri")
    return trx


@app.put("/transactions/{transaction_id}/return", response_model=TransactionResponse, tags=["Transactions"])
def return_book_endpoint(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """
    Kembalikan buku (borrowed → returned/overdue).

    Business rules:
    - `available_stock` buku otomatis bertambah 1
    - Jika terlambat: status → `overdue`, denda dibuat otomatis (Rp 1.000/hari)
    - Jika tepat waktu: status → `returned`
    """
    trx = crud.return_book(db=db, transaction_id=transaction_id)
    if not trx:
        raise HTTPException(
            status_code=404,
            detail=f"Transaksi id={transaction_id} tidak ditemukan atau tidak berstatus 'borrowed'",
        )
    return trx


# ============================================================
# FINES (DENDA)
# ============================================================

@app.get("/fines", response_model=FineListResponse, tags=["Fines"])
def list_fines(
    skip:          int        = Query(0,    ge=0,       description="Offset pagination"),
    limit:         int        = Query(50,   ge=1, le=200, description="Jumlah data"),
    status_filter: str | None = Query(None,             description="Filter: unpaid | pending_verification | paid | rejected"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil daftar denda. Admin melihat semua denda; Member hanya melihat denda miliknya."""
    user_id_filter = None if current_user.role == "admin" else current_user.user_id
    return crud.get_fines(db=db, skip=skip, limit=limit, status_filter=status_filter, user_id=user_id_filter)


@app.post("/fines/{fine_id}/submit-payment", response_model=FineResponse, tags=["Fines"])
def submit_fine_payment_endpoint(fine_id: int, data: FinePaymentSubmit, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Member mengirimkan bukti pembayaran denda miliknya. Admin dapat submit untuk denda siapa saja."""
    fine = crud.get_fine(db=db, fine_id=fine_id)
    if not fine:
        raise HTTPException(status_code=404, detail=f"Denda id={fine_id} tidak ditemukan")
    if current_user.role != "admin" and fine.transaction.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak: Anda hanya dapat membayar denda milik Anda sendiri")
    fine = crud.submit_fine_payment(db=db, fine_id=fine_id, proof_url=data.payment_proof_url)
    return fine


@app.put("/fines/{fine_id}/approve", response_model=FineResponse, tags=["Fines"])
def admin_approve_fine_endpoint(fine_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Tandai denda sebagai lunas (Admin verifikasi bukti bayar)."""
    fine = crud.admin_approve_fine(db=db, fine_id=fine_id)
    if not fine:
        raise HTTPException(status_code=404, detail=f"Denda id={fine_id} tidak ditemukan")
    return fine


@app.put("/fines/{fine_id}/reject", response_model=FineResponse, tags=["Fines"])
def admin_reject_fine_endpoint(fine_id: int, data: FineRejectRequest, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    """Tolak bukti pembayaran jika tidak valid (Admin)."""
    fine = crud.admin_reject_fine(db=db, fine_id=fine_id, note=data.rejection_note)
    if not fine:
        raise HTTPException(status_code=404, detail=f"Denda id={fine_id} tidak ditemukan")
    return fine