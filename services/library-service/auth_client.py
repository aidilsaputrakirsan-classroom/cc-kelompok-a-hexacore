import os
import httpx
import asyncio
import logging
from fastapi import HTTPException, Header, Depends, status
from typing import Optional

from config import settings
from circuit_breaker import CircuitBreaker

logger = logging.getLogger(__name__)

AUTH_SERVICE_URL = settings.AUTH_SERVICE_URL

# =====================
# RETRY CONFIG
# =====================
MAX_RETRIES = 3
BASE_DELAY = 0.5           # 0.5 detik delay awal
TIMEOUT_SECONDS = 5.0      # Timeout per request

# Error yang layak di-retry (transient errors)
RETRYABLE_STATUS_CODES = {500, 502, 503, 504}

# Circuit breaker instance (global — shared di seluruh app)
auth_circuit = CircuitBreaker(
    name="auth-service",
    failure_threshold=5,
    cooldown_seconds=30,
)


async def _send_request_with_retry(
    method: str, 
    path: str, 
    headers: Optional[dict] = None, 
    timeout: float = TIMEOUT_SECONDS
) -> httpx.Response:
    """
    Kirim request HTTP ke Auth Service dengan Circuit Breaker + Retry + Exponential Backoff.
    """
    # Check circuit breaker
    if not auth_circuit.can_execute():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth Service circuit breaker OPEN. Try again later."
        )
        
    last_exception = None
    url = f"{AUTH_SERVICE_URL.rstrip('/')}/{path.lstrip('/')}"
    
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    timeout=timeout,
                )
            
            # Jika respon server error yang layak di-retry
            if response.status_code in RETRYABLE_STATUS_CODES:
                logger.warning(
                    f"Auth Service returned status {response.status_code} "
                    f"on {method} {path} (attempt {attempt}/{MAX_RETRIES})"
                )
                last_exception = httpx.HTTPStatusError(
                    message=f"Server error: {response.status_code}",
                    request=response.request,
                    response=response
                )
            else:
                # Berhasil (atau error client 4xx yang menunjukkan service responsif)
                auth_circuit.record_success()
                return response
                
        except (httpx.ConnectError, httpx.ConnectTimeout) as e:
            logger.warning(
                f"Cannot connect to Auth Service on {method} {path} "
                f"(attempt {attempt}/{MAX_RETRIES}): {e}"
            )
            last_exception = e
            
        except httpx.TimeoutException as e:
            logger.warning(
                f"Auth Service timeout on {method} {path} "
                f"(attempt {attempt}/{MAX_RETRIES}): {e}"
            )
            last_exception = e
            
        # Exponential backoff (hanya jika akan retry)
        if attempt < MAX_RETRIES:
            delay = BASE_DELAY * (2 ** (attempt - 1))  # 0.5s, 1s, 2s
            logger.info(f"Retrying in {delay}s...")
            await asyncio.sleep(delay)
            
    # Jika sampai di sini, artinya semua attempt gagal -> catat kegagalan di circuit breaker
    auth_circuit.record_failure()
    logger.error(f"Auth Service unreachable or failing after {MAX_RETRIES} attempts on {method} {path}")
    
    if isinstance(last_exception, httpx.HTTPStatusError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Layanan autentikasi gagal: {last_exception.response.status_code}"
        )
    elif isinstance(last_exception, httpx.TimeoutException):
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Koneksi ke Auth Service timeout"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Tidak dapat menghubungi Auth Service. Apakah service sudah berjalan?"
        )


async def verify_token_with_auth_service(authorization: str = Header(...)) -> dict:
    """
    Dependency: Memanggil Auth Service via HTTP untuk verifikasi JWT.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Format token salah. Gunakan Bearer <token>"
        )
    
    response = await _send_request_with_retry(
        method="GET",
        path="/verify",
        headers={"Authorization": authorization}
    )
    
    if response.status_code == 200:
        return response.json()  # {user_id, email, full_name, role}
    elif response.status_code == 401:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau kadaluarsa"
        )
    elif response.status_code == 400:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bad auth request"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Layanan autentikasi gagal memberikan respon valid: {response.status_code}"
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


async def get_current_user_optional_degraded(
    authorization: Optional[str] = Header(None)
) -> Optional[dict]:
    """
    Dependency injection: dapatkan user aktif dari token.
    Jika Auth Service down (circuit breaker OPEN atau transient error 503/504),
    maka degraded mode aktif: return None (mengizinkan akses tanpa auth).
    Namun jika Auth Service UP dan token dikirim tapi invalid, tetap raise 401.
    Jika Auth Service UP dan token tidak dikirim, raise 401.
    """
    # 1. Cek status circuit breaker sebelum memanggil Auth Service
    if not auth_circuit.can_execute():
        logger.warning(
            "[Degraded Mode] Auth Service circuit breaker is OPEN. "
            "Akses diizinkan tanpa autentikasi (degraded)."
        )
        return None

    if not authorization:
        # Jika circuit breaker CLOSED (normal), butuh otorisasi
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Header otorisasi diperlukan (normal mode)"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Format token salah. Gunakan Bearer <token>"
        )

    try:
        response = await _send_request_with_retry(
            method="GET",
            path="/verify",
            headers={"Authorization": authorization}
        )
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token tidak valid atau kadaluarsa"
            )
        elif response.status_code == 400:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bad auth request"
            )
        else:
            if not auth_circuit.can_execute():
                logger.warning("[Degraded Mode] Auth Service gagal. Fallback ke degraded mode.")
                return None
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Layanan autentikasi gagal: {response.status_code}"
            )
            
    except HTTPException as e:
        if e.status_code in {status.HTTP_503_SERVICE_UNAVAILABLE, status.HTTP_504_GATEWAY_TIMEOUT}:
            logger.warning(f"[Degraded Mode] Auth Service unavailable ({e.detail}). Fallback ke degraded mode.")
            return None
        raise e
        
    except Exception as e:
        if not auth_circuit.can_execute():
            logger.warning(f"[Degraded Mode] Koneksi ke Auth Service gagal: {e}. Fallback ke degraded mode.")
            return None
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Otorisasi gagal karena Auth Service tidak dapat dihubungi"
        )


async def check_user_exists(user_id: int) -> bool:
    """
    Mengecek apakah user dengan ID tertentu ada di sistem.
    """
    try:
        response = await _send_request_with_retry(
            method="GET",
            path=f"/users/{user_id}",
            timeout=3.0
        )
        return response.status_code == 200
    except Exception:
        return False


async def fetch_user_by_id(user_id: int) -> Optional[dict]:
    """
    Mengambil data user berdasarkan ID dari Auth Service.
    """
    try:
        response = await _send_request_with_retry(
            method="GET",
            path=f"/users/{user_id}",
            timeout=3.0
        )
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass
    return None
