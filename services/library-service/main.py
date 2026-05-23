import os
from pathlib import Path
import uuid
import asyncio
from fastapi import FastAPI, Depends, HTTPException, Query, File, UploadFile, status
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import engine, get_db, Base
import models
import schemas
import crud
from config import settings
import auth_client

# Buat semua tabel di database (jika belum ada)
Base.metadata.create_all(bind=engine)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
FINES_DIR = STATIC_DIR / "fines"
COVERS_DIR = STATIC_DIR / "covers"

# Inisialisasi FastAPI App
app = FastAPI(
    title="LenteraPustaka Library Service",
    description=(
        "REST API Layanan Perpustakaan (Katalog, Transaksi, & Denda) — Komputasi Awan SI ITK\n\n"
        "Kelompok A (HEXACORE)\n"
        "**Arsitektur:** Database-per-service microservice"
    ),
    version="1.0.0",
)

# ==================== STATIC FILES ====================
FINES_DIR.mkdir(parents=True, exist_ok=True)
COVERS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# ==================== CORS ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def raise_http_from_crud_error(error: ValueError) -> None:
    status_code = 409 if isinstance(error, crud.ConflictError) else 400
    raise HTTPException(status_code=status_code, detail=str(error))


# ============================================================
# ENRICHMENT HELPERS FOR INTER-SERVICE DATA
# ============================================================

async def enrich_transaction(trx) -> dict:
    """Enrich transaksi dengan mengambil detail user secara asinkron dari Auth Service."""
    if not trx:
        return None
    
    # Ambil data user secara asinkron
    user_data = await auth_client.fetch_user_by_id(trx.user_id)
    
    user_obj = None
    if user_data:
        user_obj = {
            "user_id": user_data.get("user_id"),
            "email": user_data.get("email"),
            "full_name": user_data.get("full_name"),
            "role": user_data.get("role")
        }
        
    return {
        "transaction_id": trx.transaction_id,
        "user_id": trx.user_id,
        "book_id": trx.book_id,
        "borrow_date": trx.borrow_date,
        "due_date": trx.due_date,
        "return_date": trx.return_date,
        "status": trx.status,
        "book": trx.book,
        "user": user_obj
    }


async def enrich_transactions_list(trxs: list) -> list:
    """Enrich list transaksi secara konkuren menggunakan asyncio.gather."""
    if not trxs:
        return []
    tasks = [enrich_transaction(t) for t in trxs]
    return await asyncio.gather(*tasks)


# ============================================================
# UPLOAD
# ============================================================

@app.post("/upload/fines", tags=["Upload"])
async def upload_fine_proof(
    file: UploadFile = File(...), 
    current_user: dict = Depends(auth_client.get_current_user)
):
    """
    Upload bukti pembayaran denda (Image only).
    File akan disimpan di folder 'static/fines'.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar (jpg, png, jpeg)")

    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = FINES_DIR / unique_filename

    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan file: {str(e)}")

    return {"url": f"/static/fines/{unique_filename}"}


@app.post("/upload/covers", tags=["Upload"])
async def upload_book_cover(
    file: UploadFile = File(...), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """
    Upload cover buku (Image only).
    File akan disimpan di folder 'static/covers'.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar (jpg, png, jpeg)")

    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = COVERS_DIR / unique_filename

    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan file: {str(e)}")

    return {"url": f"/static/covers/{unique_filename}"}


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint untuk mengecek status API dan database."""
    health = {
        "status": "healthy",
        "service": "library-service",
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
# CATEGORIES
# ============================================================

@app.post("/categories", response_model=schemas.CategoryResponse, status_code=201, tags=["Categories"])
def create_category(
    data: schemas.CategoryCreate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Tambah kategori buku baru. **Hanya Admin.**"""
    try:
        return crud.create_category(db=db, data=data)
    except ValueError as e:
        raise_http_from_crud_error(e)


@app.get("/categories", response_model=list[schemas.CategoryResponse], tags=["Categories"])
def list_categories(
    skip:  int = Query(0,   ge=0,  description="Offset pagination"),
    limit: int = Query(100, ge=1, le=200, description="Jumlah data"),
    db: Session = Depends(get_db)
):
    """Ambil semua kategori buku."""
    return crud.get_categories(db=db, skip=skip, limit=limit)


@app.get("/categories/{category_id}", response_model=schemas.CategoryResponse, tags=["Categories"])
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Ambil satu kategori berdasarkan ID."""
    category = crud.get_category(db=db, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail=f"Kategori id={category_id} tidak ditemukan")
    return category


@app.put("/categories/{category_id}", response_model=schemas.CategoryResponse, tags=["Categories"])
def update_category(
    category_id: int, 
    data: schemas.CategoryCreate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Update nama dan deskripsi kategori. **Hanya Admin.**"""
    try:
        updated = crud.update_category(db=db, category_id=category_id, data=data)
    except ValueError as e:
        raise_http_from_crud_error(e)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Kategori id={category_id} tidak ditemukan")
    return updated


@app.delete("/categories/{category_id}", status_code=204, tags=["Categories"])
def delete_category(
    category_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Hapus kategori. **Hanya Admin.**"""
    success = crud.delete_category(db=db, category_id=category_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Kategori id={category_id} tidak ditemukan")
    return None


# ============================================================
# GENRES
# ============================================================

@app.post("/genres", response_model=schemas.GenreResponse, status_code=201, tags=["Genres"])
def create_genre(
    data: schemas.GenreCreate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Tambah genre buku baru. **Hanya Admin.**"""
    try:
        return crud.create_genre(db=db, data=data)
    except ValueError as e:
        raise_http_from_crud_error(e)


@app.get("/genres", response_model=list[schemas.GenreResponse], tags=["Genres"])
def list_genres(
    skip:  int = Query(0,   ge=0,  description="Offset pagination"),
    limit: int = Query(100, ge=1, le=200, description="Jumlah data"),
    db: Session = Depends(get_db)
):
    """Ambil semua genre."""
    return crud.get_genres(db=db, skip=skip, limit=limit)


@app.get("/genres/{genre_id}", response_model=schemas.GenreResponse, tags=["Genres"])
def get_genre(genre_id: int, db: Session = Depends(get_db)):
    """Ambil satu genre berdasarkan ID."""
    genre = crud.get_genre(db=db, genre_id=genre_id)
    if not genre:
        raise HTTPException(status_code=404, detail=f"Genre id={genre_id} tidak ditemukan")
    return genre


@app.put("/genres/{genre_id}", response_model=schemas.GenreResponse, tags=["Genres"])
def update_genre(
    genre_id: int, 
    data: schemas.GenreCreate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Update nama dan deskripsi genre. **Hanya Admin.**"""
    try:
        updated = crud.update_genre(db=db, genre_id=genre_id, data=data)
    except ValueError as e:
        raise_http_from_crud_error(e)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Genre id={genre_id} tidak ditemukan")
    return updated


@app.delete("/genres/{genre_id}", status_code=204, tags=["Genres"])
def delete_genre(
    genre_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Hapus genre. **Hanya Admin.**"""
    success = crud.delete_genre(db=db, genre_id=genre_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Genre id={genre_id} tidak ditemukan")
    return None


# ============================================================
# BOOKS
# ============================================================

@app.post("/books", response_model=schemas.BookResponse, status_code=201, tags=["Books"])
def create_book(
    data: schemas.BookCreate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Tambah buku baru ke inventaris. **Hanya Admin.**"""
    try:
        return crud.create_book(db=db, data=data)
    except ValueError as e:
        raise_http_from_crud_error(e)


@app.get("/books", response_model=schemas.BookListResponse, tags=["Books"])
def list_books(
    skip:        int        = Query(0,    ge=0,       description="Offset pagination"),
    limit:       int        = Query(20,   ge=1, le=100, description="Jumlah data per halaman"),
    search:      str | None = Query(None,             description="Cari berdasarkan judul, pengarang, atau ISBN"),
    category_id: int | None = Query(None, ge=1,       description="Filter berdasarkan ID kategori"),
    db: Session = Depends(get_db)
):
    """Ambil daftar buku dengan pagination, pencarian, dan filter kategori."""
    return crud.get_books(db=db, skip=skip, limit=limit, search=search, category_id=category_id)


@app.get("/books/stats", response_model=schemas.BookStatsResponse, tags=["Books"])
def get_book_stats(db: Session = Depends(get_db)):
    """Statistik inventaris buku."""
    return crud.get_book_stats(db=db)


@app.get("/books/{book_id}", response_model=schemas.BookResponse, tags=["Books"])
def get_book(book_id: int, db: Session = Depends(get_db)):
    """Ambil detail satu buku berdasarkan ID."""
    book = crud.get_book(db=db, book_id=book_id)
    if not book:
        raise HTTPException(status_code=404, detail=f"Buku id={book_id} tidak ditemukan")
    return book


@app.put("/books/{book_id}", response_model=schemas.BookResponse, tags=["Books"])
def update_book(
    book_id: int, 
    data: schemas.BookUpdate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Update data buku. **Hanya Admin.**"""
    try:
        updated = crud.update_book(db=db, book_id=book_id, data=data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not updated:
        raise HTTPException(status_code=404, detail=f"Buku id={book_id} tidak ditemukan")
    return updated


@app.delete("/books/{book_id}", status_code=204, tags=["Books"])
def delete_book(
    book_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Hapus buku dari inventaris. **Hanya Admin.**"""
    success = crud.delete_book(db=db, book_id=book_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Buku id={book_id} tidak ditemukan")
    return None


# ============================================================
# TRANSACTIONS (BORROW & RETURN)
# ============================================================

@app.post("/transactions", response_model=schemas.TransactionResponse, status_code=201, tags=["Transactions"])
async def borrow_book(
    data: schemas.TransactionCreate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_current_user)
):
    """Ajukan peminjaman buku (status awal: 'pending')."""
    # 1. Validasi hak akses: Member hanya bisa pinjam untuk dirinya sendiri, admin bebas
    if current_user.get("role") != "admin" and data.user_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=403,
            detail="Akses ditolak: Member hanya dapat mengajukan peminjaman atas nama dirinya sendiri",
        )
    
    # 2. Validasi apakah user eksis di Auth Service (Logical constraint)
    user_exists = await auth_client.check_user_exists(data.user_id)
    if not user_exists:
        raise HTTPException(
            status_code=400,
            detail=f"User id={data.user_id} tidak ditemukan di sistem"
        )

    try:
        trx = crud.create_transaction(db=db, data=data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if trx is None:
        raise HTTPException(
            status_code=400,
            detail="Stok buku habis — tidak tersedia untuk dipinjam saat ini",
        )
    
    return await enrich_transaction(trx)


@app.put("/transactions/{transaction_id}/approve", response_model=schemas.TransactionResponse, tags=["Transactions"])
async def approve_transaction_admin(
    transaction_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Admin menyetujui pengajuan peminjaman (pending → borrowed)."""
    try:
        trx = crud.approve_transaction(db=db, transaction_id=transaction_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not trx:
        raise HTTPException(
            status_code=404,
            detail=f"Transaksi id={transaction_id} tidak ditemukan atau bukan berstatus 'pending'",
        )
    
    return await enrich_transaction(trx)


@app.put("/transactions/{transaction_id}/reject", response_model=schemas.TransactionResponse, tags=["Transactions"])
async def reject_transaction_admin(
    transaction_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Admin menolak pengajuan peminjaman (pending → rejected)."""
    trx = crud.reject_transaction(db=db, transaction_id=transaction_id)
    if not trx:
        raise HTTPException(
            status_code=404,
            detail=f"Transaksi id={transaction_id} tidak ditemukan atau bukan berstatus 'pending'",
        )
    return await enrich_transaction(trx)


@app.get("/transactions", response_model=schemas.TransactionListResponse, tags=["Transactions"])
async def list_transactions(
    skip:   int        = Query(0,    ge=0,       description="Offset pagination"),
    limit:  int        = Query(20,   ge=1, le=100, description="Jumlah data per halaman"),
    status: str | None = Query(None,             description="Filter status: pending | borrowed | returned | overdue | rejected | lost"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth_client.get_current_user),
):
    """Ambil daftar transaksi. Admin melihat semua; Member hanya melihat transaksi miliknya."""
    user_id_filter = None if current_user.get("role") == "admin" else current_user.get("user_id")
    result = crud.get_transactions(db=db, skip=skip, limit=limit, status=status, user_id=user_id_filter)
    
    # Enrich transactions list with user details from Auth Service
    enriched_trxs = await enrich_transactions_list(result["transactions"])
    return {"total": result["total"], "transactions": enriched_trxs}


@app.get("/transactions/{transaction_id}", response_model=schemas.TransactionResponse, tags=["Transactions"])
async def get_transaction_detail(
    transaction_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_current_user)
):
    """Ambil detail transaksi. Admin bisa lihat semua; Member hanya bisa lihat miliknya."""
    trx = crud.get_transaction(db=db, transaction_id=transaction_id)
    if not trx:
        raise HTTPException(status_code=404, detail=f"Transaksi id={transaction_id} tidak ditemukan")
    if current_user.get("role") != "admin" and trx.user_id != current_user.get("user_id"):
        raise HTTPException(status_code=403, detail="Akses ditolak: Anda hanya dapat melihat transaksi milik Anda sendiri")
    return await enrich_transaction(trx)


@app.put("/transactions/{transaction_id}/return", response_model=schemas.TransactionResponse, tags=["Transactions"])
async def return_book_endpoint(
    transaction_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_current_user)
):
    """Kembalikan buku (borrowed → returned/overdue)."""
    trx_check = crud.get_transaction(db=db, transaction_id=transaction_id)
    if not trx_check:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")

    if current_user.get("role") != "admin" and trx_check.user_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=403, 
            detail="Akses ditolak: Anda hanya bisa mengembalikan buku yang Anda pinjam sendiri"
        )

    trx = crud.return_book(db=db, transaction_id=transaction_id)
    if not trx:
        raise HTTPException(
            status_code=400,
            detail=f"Transaksi id={transaction_id} tidak berstatus 'borrowed' (mungkin sudah dikembalikan atau masih pending)",
        )
    return await enrich_transaction(trx)


@app.post("/transactions/{transaction_id}/lost", response_model=schemas.TransactionResponse, tags=["Transactions"])
async def report_lost_book_endpoint(
    transaction_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_current_user)
):
    """Laporkan buku hilang (borrowed/overdue → lost)."""
    trx_check = crud.get_transaction(db=db, transaction_id=transaction_id)
    if not trx_check:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")

    if current_user.get("role") != "admin" and trx_check.user_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=403, 
            detail="Akses ditolak: Anda hanya bisa melaporkan buku yang Anda pinjam sendiri"
        )
    
    try:
        trx = crud.report_book_lost(db=db, transaction_id=transaction_id)
        if not trx:
            raise HTTPException(
                status_code=404,
                detail="Transaksi tidak ditemukan"
            )
        return await enrich_transaction(trx)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================
# SIMULATE OVERDUE (TESTING ONLY)
# ============================================================

@app.post("/transactions/{transaction_id}/simulate-overdue", response_model=schemas.TransactionResponse, tags=["Testing"])
async def simulate_overdue_admin(
    transaction_id: int,
    days_late: int = Query(3, description="Berapa hari telatnya?"),
    db: Session = Depends(get_db),
    admin_user: dict = Depends(auth_client.get_admin_user),
):
    """[TESTING ONLY] Simulasi buku terlambat dikembalikan."""
    try:
        trx = crud.simulate_overdue(db, transaction_id, days_late)
        if not trx:
            raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
        return await enrich_transaction(trx)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================
# FINES (DENDA)
# ============================================================

@app.get("/fines", response_model=schemas.FineListResponse, tags=["Fines"])
def list_fines(
    skip:          int        = Query(0,    ge=0,       description="Offset pagination"),
    limit:         int        = Query(50,   ge=1, le=200, description="Jumlah data"),
    status_filter: str | None = Query(None,             description="Filter: unpaid | pending_verification | paid | rejected"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth_client.get_current_user),
):
    """Ambil daftar denda. Admin melihat semua denda; Member hanya melihat denda miliknya."""
    user_id_filter = None if current_user.get("role") == "admin" else current_user.get("user_id")
    return crud.get_fines(db=db, skip=skip, limit=limit, status_filter=status_filter, user_id=user_id_filter)


@app.post("/fines/{fine_id}/submit-payment", response_model=schemas.FineResponse, tags=["Fines"])
def submit_fine_payment_endpoint(
    fine_id: int, 
    data: schemas.FinePaymentSubmit, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_current_user)
):
    """Member mengirimkan bukti pembayaran denda miliknya. Admin dapat submit untuk denda siapa saja."""
    fine = crud.get_fine(db=db, fine_id=fine_id)
    if not fine:
        raise HTTPException(status_code=404, detail=f"Denda id={fine_id} tidak ditemukan")
    
    # fine.transaction adalah 1:1, kita cek user_id transaksinya
    if current_user.get("role") != "admin" and fine.transaction.user_id != current_user.get("user_id"):
        raise HTTPException(status_code=403, detail="Akses ditolak: Anda hanya dapat membayar denda milik Anda sendiri")
    
    fine = crud.submit_fine_payment(db=db, fine_id=fine_id, proof_url=data.payment_proof_url)
    return fine


@app.put("/fines/{fine_id}/approve", response_model=schemas.FineResponse, tags=["Fines"])
def admin_approve_fine_endpoint(
    fine_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Tandai denda sebagai lunas (Admin verifikasi bukti bayar). **Hanya Admin.**"""
    fine = crud.admin_approve_fine(db=db, fine_id=fine_id)
    if not fine:
        raise HTTPException(status_code=404, detail=f"Denda id={fine_id} tidak ditemukan")
    return fine


@app.put("/fines/{fine_id}/reject", response_model=schemas.FineResponse, tags=["Fines"])
def admin_reject_fine_endpoint(
    fine_id: int, 
    data: schemas.FineRejectRequest, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth_client.get_admin_user)
):
    """Tolak bukti pembayaran jika tidak valid (Admin). **Hanya Admin.**"""
    fine = crud.admin_reject_fine(db=db, fine_id=fine_id, note=data.rejection_note)
    if not fine:
        raise HTTPException(status_code=404, detail=f"Denda id={fine_id} tidak ditemukan")
    return fine
