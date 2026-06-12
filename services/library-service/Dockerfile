# ============================================================
# STAGE 1: Builder (Tahap Instalasi/Memasak)
# ============================================================
# Gunakan image Python slim sebagai base untuk instalasi
FROM python:3.12-slim AS builder

# Tentukan folder kerja untuk proses instalasi
WORKDIR /install

# Install tools yang dibutuhkan untuk mengkompilasi library Python (seperti psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy file requirements agar bisa di-install
COPY requirements.txt .

# Install semua library ke folder /install (menggunakan prefix)
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ============================================================
# STAGE 2: Final (Image Produksi yang Langsing)
# ============================================================
# Gunakan image Python slim lagi untuk hasil akhir
FROM python:3.12-slim

# Tentukan folder kerja utama aplikasi
WORKDIR /app

# --- TUGAS DEVOPS: Keamanan (Non-Root User) ---
# Membuat user baru agar aplikasi tidak berjalan sebagai 'root'
RUN useradd -m appuser

# Install 'curl' untuk fitur Healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# --- INTI OPTIMASI (Multi-Stage Copy) ---
# Hanya mengambil hasil library yang sudah 'matang' dari Stage 1 (Builder)
COPY --from=builder /install/lib /usr/local/lib
COPY --from=builder /install/bin /usr/local/bin

# Copy seluruh kode program library-service ke dalam container
COPY . .

# Pastikan folder static, covers, dan fines terbuat dan dimiliki oleh appuser
# Ini sangat penting agar upload bukti denda dan cover buku tidak error karena permission denied!
RUN mkdir -p /app/static/covers /app/static/fines && \
    chown -R appuser:appuser /app

# --- TUGAS DEVOPS: Izin Akses ---
# Jalankan container menggunakan user non-root tadi
USER appuser

# Beritahu Docker bahwa aplikasi berjalan di port 8002
EXPOSE ${PORT:-8002}

# --- TUGAS BACKEND: Healthcheck ---
# Mengecek status aplikasi setiap 30 detik via endpoint /health di port 8002
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8002}/health || exit 1

# Perintah utama untuk menyalakan aplikasi FastAPI menggunakan Uvicorn
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8002}
