import os
import httpx
from fastapi import HTTPException, Header, Depends, status
from typing import Optional

from config import settings

AUTH_SERVICE_URL = settings.AUTH_SERVICE_URL


async def verify_token_with_auth_service(authorization: str = Header(...)) -> dict:
    """
    Dependency: Memanggil Auth Service via HTTP untuk verifikasi JWT.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Format token salah. Gunakan Bearer <token>"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/verify",
                headers={"Authorization": authorization},
                timeout=5.0
            )
            
        if response.status_code == 200:
            return response.json()  # {user_id, email, full_name, role}
        elif response.status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token tidak valid atau kadaluarsa"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Layanan autentikasi gagal memberikan respon valid"
            )
            
    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Tidak dapat menghubungi Auth Service. Apakah service sudah berjalan?"
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Koneksi ke Auth Service timeout"
        )


def get_current_user(user: dict = Depends(verify_token_with_auth_service)) -> dict:
    """
    Dependency injection: dapatkan user aktif dari token.
    Mengembalikan dict user: {user_id, email, full_name, role}
    """
    return user


def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency injection: pastikan user adalah admin.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hak akses ditolak, Anda bukan admin"
        )
    return current_user


async def check_user_exists(user_id: int) -> bool:
    """
    Mengecek apakah user dengan ID tertentu ada di sistem.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{AUTH_SERVICE_URL}/users/{user_id}", timeout=3.0)
            return response.status_code == 200
    except Exception:
        return False


async def fetch_user_by_id(user_id: int) -> Optional[dict]:
    """
    Mengambil data user berdasarkan ID dari Auth Service.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{AUTH_SERVICE_URL}/users/{user_id}", timeout=3.0)
            if response.status_code == 200:
                return response.json()
    except Exception:
        pass
    return None
