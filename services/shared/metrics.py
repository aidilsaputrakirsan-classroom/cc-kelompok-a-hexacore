"""
Simple In-Memory Metrics Collector.
Mengumpulkan metrics dasar: request count, error count, latency.
"""
import time
import threading
from collections import defaultdict


class MetricsCollector:
    """Thread-safe metrics collector."""

    def __init__(self):
        self._lock = threading.Lock()
        self.start_time = time.time()

        # Counters
        self.request_count = 0
        self.error_count = 0          # 4xx + 5xx
        self.status_counts = defaultdict(int)  # per status code

        # Latency tracking (last 1000 requests)
        self.latencies = []
        self.max_latency_samples = 1000

        # Per-endpoint stats
        self.endpoint_stats = defaultdict(lambda: {
            "count": 0,
            "errors": 0,
            "total_latency_ms": 0,
        })

        # Rolling window untuk error rate tracking (60 detik terakhir)
        self.recent_requests = []  # list of tuples: (timestamp, is_error)
    def record_request(self, method: str, path: str, status_code: int, duration_ms: float):
        """Catat satu request."""
        with self._lock:
            self.request_count += 1
            self.status_counts[status_code] += 1

            is_error = status_code >= 400
            if is_error:
                self.error_count += 1

            # Latency
            self.latencies.append(duration_ms)
            if len(self.latencies) > self.max_latency_samples:
                self.latencies.pop(0)

            # Per-endpoint
            key = f"{method} {path}"
            self.endpoint_stats[key]["count"] += 1
            self.endpoint_stats[key]["total_latency_ms"] += duration_ms
            if is_error:
                self.endpoint_stats[key]["errors"] += 1

            # Catat request ke rolling window
            now = time.time()
            self.recent_requests.append((now, is_error))
            
            # Pruning window (buang data yang lebih dari 60 detik langsung di sini)
            cutoff = now - 60.0
            self.recent_requests = [r for r in self.recent_requests if r[0] >= cutoff]

    def get_recent_error_rate(self, seconds: float = 60.0) -> tuple[float, int]:
        """Hitung error rate dalam X detik terakhir. Mengembalikan (error_rate_percent, total_requests)."""
        with self._lock:
            now = time.time()
            cutoff = now - seconds
            # Bersihkan request lama
            self.recent_requests = [r for r in self.recent_requests if r[0] >= cutoff]

            total_recent = len(self.recent_requests)
            if total_recent == 0:
                return 0.0, 0

            errors_recent = sum(1 for r in self.recent_requests if r[1])
            error_rate = round((errors_recent / total_recent) * 100, 2)
            return error_rate, total_recent
    def get_metrics(self) -> dict:
        """Return snapshot metrics."""
        with self._lock:
            uptime = round(time.time() - self.start_time, 1)
            error_rate = (
                round(self.error_count / self.request_count * 100, 2)
                if self.request_count > 0 else 0
            )

            # Latency percentiles
            latency_stats = {}
            if self.latencies:
                sorted_lat = sorted(self.latencies)
                n = len(sorted_lat)
                latency_stats = {
                    "p50_ms": round(sorted_lat[int(n * 0.5)], 2),
                    "p95_ms": round(sorted_lat[int(n * 0.95)], 2),
                    "p99_ms": round(sorted_lat[min(int(n * 0.99), n - 1)], 2),
                    "avg_ms": round(sum(sorted_lat) / n, 2),
                }

            # Top endpoints
            endpoints = {}
            for key, stats in self.endpoint_stats.items():
                avg_lat = (
                    round(stats["total_latency_ms"] / stats["count"], 2)
                    if stats["count"] > 0 else 0
                )
                endpoints[key] = {
                    "count": stats["count"],
                    "errors": stats["errors"],
                    "avg_latency_ms": avg_lat,
                }

            return {
                "uptime_seconds": uptime,
                "total_requests": self.request_count,
                "total_errors": self.error_count,
                "error_rate_percent": error_rate,
                "status_codes": dict(self.status_counts),
                "latency": latency_stats,
                "endpoints": endpoints,
            }

    def reset(self):
        """Reset semua metrics."""
        with self._lock:
            self.request_count = 0
            self.error_count = 0
            self.status_counts.clear()
            self.latencies.clear()
            self.endpoint_stats.clear()


# Singleton instance
metrics = MetricsCollector()
