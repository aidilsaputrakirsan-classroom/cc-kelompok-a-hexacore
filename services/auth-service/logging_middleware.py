"""
Request Logging Middleware.
Log setiap HTTP request dengan timing, status, dan correlation ID, serta mencatat metrics.
"""
import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from metrics import metrics

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware yang log setiap request/response dan mencatat metrics."""

    async def dispatch(self, request: Request, call_next):
        # Generate atau ambil correlation ID
        correlation_id = request.headers.get(
            "X-Correlation-ID",
            str(uuid.uuid4())[:12]
        )

        # Simpan di request state (bisa diakses di endpoint)
        request.state.correlation_id = correlation_id

        # Catat waktu mulai
        start_time = time.time()

        # Proses request
        try:
            response = await call_next(request)
        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            # Catat metrics untuk request error 500
            metrics.record_request(request.method, request.url.path, 500, duration_ms)
            
            # Hitung error rate 1 menit terakhir
            recent_error_rate, total_recent = metrics.get_recent_error_rate(60.0)
            
            log_level = logging.ERROR
            extra_fields = {
                "correlation_id": correlation_id,
                "method": request.method,
                "path": request.url.path,
                "duration_ms": duration_ms,
                "status_code": 500,
            }
            
            if total_recent >= 5 and recent_error_rate > 10.0:
                log_level = logging.CRITICAL
                extra_fields["alert"] = True
                msg = f"CRITICAL: High error rate ({recent_error_rate:.1f}%) in the last 1 minute! Request failed: {request.method} {request.url.path}"
            else:
                msg = f"Request failed: {request.method} {request.url.path}"
                
            logger.log(log_level, msg, extra=extra_fields)
            raise

        # Hitung durasi
        duration_ms = round((time.time() - start_time) * 1000, 2)

        # Catat metrics untuk request (semua request)
        metrics.record_request(request.method, request.url.path, response.status_code, duration_ms)

        # Log request (skip health checks dan metrics endpoint agar log tidak terlalu noisy)
        if request.url.path not in ["/health", "/metrics"]:
            # Hitung error rate 1 menit terakhir
            recent_error_rate, total_recent = metrics.get_recent_error_rate(60.0)
            
            log_level = logging.WARNING if response.status_code >= 400 else logging.INFO
            extra_fields = {
                "correlation_id": correlation_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            }
            
            if response.status_code >= 400 and total_recent >= 5 and recent_error_rate > 10.0:
                log_level = logging.CRITICAL
                extra_fields["alert"] = True
                msg = f"CRITICAL: High error rate ({recent_error_rate:.1f}%) in the last 1 minute! {request.method} {request.url.path} → {response.status_code} ({duration_ms}ms)"
            else:
                msg = f"{request.method} {request.url.path} → {response.status_code} ({duration_ms}ms)"
                
            logger.log(
                log_level,
                msg,
                extra=extra_fields,
            )

        # Teruskan correlation ID di response header
        response.headers["X-Correlation-ID"] = correlation_id
        return response

