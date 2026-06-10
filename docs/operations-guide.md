# 📖 Panduan Operasional (Operations Guide) - LenteraPustaka

Dokumen ini adalah panduan standar operasional untuk memantau kesehatan sistem, melacak masalah (debugging), dan menangani insiden pada arsitektur Microservices LenteraPustaka.

---

## 1. Cara Mengecek Kesehatan Sistem (Health Check)

Pemantauan visual dapat dilakukan melalui **Status Dashboard** yang telah disediakan oleh tim Frontend.

* **URL Dashboard:** `http://localhost:3000/status`
* **Fungsi:** Menampilkan status *real-time* dari API Gateway, Auth Service, dan Library Service beserta metrik utamanya. Halaman ini melakukan *auto-refresh* setiap 10 detik.

**Pengecekan API Langsung (Endpoint):**
Jika antarmuka grafis bermasalah, cek langsung ke *endpoint health*:
* Gateway: `http://localhost/health`
* Auth Service: `http://localhost/auth/health`
* Library Service: `http://localhost/items/health`

---

## 2. Cara Mengecek Metrik (Metrics)

Sistem menggunakan pengumpulan metrik dalam memori (*in-memory*) untuk melacak performa berdasarkan prinsip *Golden Signals* (Latency, Traffic, Errors).

* **Akses Metrik Auth Service:** `GET http://localhost/auth/metrics`
* **Akses Metrik Library Service:** `GET http://localhost/items/metrics`

**Indikator Peringatan Dini (Alert Triggers):**
* **Latency:** Jika `p95_ms` secara konsisten melebihi **1000ms**, sistem mengalami perlambatan (*bottleneck*).
* **Error Rate:** Jika `error_rate_percent` melampaui **5%**, segera lakukan investigasi log.

---

## 3. Cara Membaca Log & Melacak Request (Tracing)

Semua layanan mencetak log dalam format **Structured JSON**. Setiap permintaan (*request*) lintas layanan diikat oleh sebuah `correlation_id` yang sama.

### Menggunakan Helper Script
Gunakan skrip pembantu yang telah disediakan di folder root proyek untuk memudahkan pembacaan:

1. **Melihat semua log secara real-time:**
   ```bash
   ./scripts/logs.sh all
    ```

2. **Menyaring HANYA log yang mengalami error (Level: ERROR):**
    ```bash
    ./scripts/logs.sh errors
    ```

3. **Melacak satu Request ID spesifik (Correlation Tracing):**
    Ambil `correlation_id` dari log gateway atau header respons, lalu jalankan:
    ```bash
    ./scripts/logs.sh trace <masukkan-correlation-id>
    ```
    (Contoh: `./scripts/logs.sh trace a1b2c3d4` akan menampilkan perjalanan request tersebut dari Gateway → Library Service → Auth Service).

## 4. Panduan Troubleshooting Umum

| Gejala / Indikasi Error | Kemungkinan Penyebab (Root Cause) | Tindakan Perbaikan (Action) |
| :--- | :--- | :--- |
| **HTTP 502 Bad Gateway** di semua rute | Kontainer *backend* (Auth/Library) mati atau *restarting*. | Cek status dengan `docker compose ps`. Restart layanan yang bermasalah. |
| **HTTP 504 Gateway Timeout** | Operasi *database* sangat lambat atau I/O Docker *bottleneck*. | Cek metrik latensi. Jika tinggi, periksa kueri DB atau *restart* Docker Desktop. |
| Log menunjukkan **Auth Service circuit breaker OPEN** | Auth Service mati atau *database auth_db* terputus. | Cek log menggunakan skrip `./scripts/logs.sh errors`. Pastikan *auth_db* berstatus *healthy*. |
| Pengunjung tidak bisa login, muncul **HTTP 401 Unauthorized** | Rahasia JWT (*Secret Key*) tidak sinkron antar layanan. | Pastikan variabel `SECRET_KEY` di *file* `docker-compose.yml` sama persis untuk lingkungan produksi. |

---

## 5. Jalur Eskalasi Insiden (Escalation Path)

Jika sistem mengalami kendala di tahap produksi dan tidak dapat diselesaikan melalui *troubleshooting* dasar, ikuti alur eskalasi berikut:

1. **Level 1 (Ops & QA):** Identifikasi masalah menggunakan `./scripts/logs.sh trace`, catat *error log* dan `correlation_id`, laporkan metrik abnormal di grup komunikasi tim.
2. **Level 2 (Lead Backend / Lead Frontend):** Teruskan log dan ID ke Lead terkait.
   * Masalah UI/Dashboard → Lead Frontend.
   * HTTP 500/Log Error Aplikasi → Lead Backend.
3. **Level 3 (Lead DevOps):** Jika masalah ada pada infrastruktur (Gateway mati, volume Docker penuh, batas memori 256MB terlampaui), eskalasikan langsung ke Lead DevOps.