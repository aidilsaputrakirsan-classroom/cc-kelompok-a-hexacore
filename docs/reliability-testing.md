# 🛡️ Laporan Pengujian Keandalan Sistem (Reliability Testing)

Dokumen ini memuat hasil pengujian keandalan (*reliability*) dan toleransi kesalahan (*fault tolerance*) pada arsitektur Microservices LenteraPustaka. Pengujian ini memastikan sistem tidak mengalami *cascading failure* saat salah satu layanan bermasalah.

## 1. Spesifikasi Konfigurasi Keandalan

Berdasarkan implementasi di dalam `auth_client.py` dan `circuit_breaker.py`, berikut adalah parameter pertahanan sistem yang telah dikonfigurasi:

* **Retry Logic (Panggilan Ulang):** Maksimal 3 kali percobaan ulang (total 4 percobaan) untuk error *transient* (500, 502, 503, 504).
* **Exponential Backoff:** Jeda waktu antar-retry adalah 0.5 detik, 1 detik, dan 2 detik.
* **Timeout:** Batas waktu tunggu maksimal per request adalah 5 detik.
* **Circuit Breaker Threshold:** Sistem akan memutus arus (*OPEN*) jika terjadi 5 kegagalan berturut-turut.
* **Circuit Breaker Cooldown:** Waktu pendinginan sebelum mencoba menyambung kembali (*HALF_OPEN*) adalah 30 detik.

---

## 2. Skenario Pengujian Manual (Simulasi Kegagalan)

### Skenario A: Auth Service Down & Retry Logic Berjalan
* **Kondisi:** Kontainer `lentera-auth-service` dimatikan secara paksa.
* **Cara Reproduksi:** 1. Jalankan `docker compose stop lentera-auth-service`.
  2. Lakukan request ke `GET /books` menggunakan token JWT yang valid.
  3. Pantau log dengan `docker logs -f lentera-library-service`.
* **Expected Behavior:** Aplikasi tidak langsung mengembalikan error. Log di Library Service akan menunjukkan peringatan kegagalan, diikuti tulisan `Retrying in 0.5s...`, `Retrying in 1.0s...`, hingga maksimal 3 kali. Setelah semua percobaan gagal, barulah API mengembalikan HTTP 503 (Service Unavailable).
* **Hasil Test:** **BERHASIL**. Sistem terbukti memberikan waktu toleransi sebelum memvonis Auth Service mati.

### Skenario B: Circuit Breaker Memutus Arus (Fail Fast)
* **Kondisi:** Auth Service masih mati, dan 5 kegagalan request (*failure threshold*) telah tercapai.
* **Cara Reproduksi:**
  1. Lakukan request terus-menerus lebih dari 5 kali ke layanan yang membutuhkan autentikasi.
  2. Lakukan request ke-6.
* **Expected Behavior:** Pada request ke-6, Library Service tidak akan menunggu *timeout* 5 detik. Sistem langsung menolak request dalam hitungan milidetik (*fail fast*) dengan pesan "Auth Service circuit breaker OPEN. Try again later."
* **Hasil Test:** **BERHASIL**. *Cascading failure* terhindari karena resource (CPU/RAM) tidak habis.

### Skenario C: Circuit Breaker Recovery (Half-Open ke Closed)
* **Kondisi:** Auth Service dihidupkan kembali setelah Circuit Breaker berada di fase *OPEN*.
* **Cara Reproduksi:**
  1. Tunggu 30 detik (masa *cooldown*).
  2. Jalankan `docker compose start lentera-auth-service`.
  3. Lakukan 1 request percobaan.
* **Expected Behavior:** Setelah *cooldown* selesai, status berubah menjadi `HALF_OPEN`. 1 request diizinkan masuk. Karena layanan sudah hidup, test berhasil, status kembali `CLOSED`, dan aplikasi beroperasi normal 100%.
* **Hasil Test:** **BERHASIL**. Sistem pulih secara otomatis tanpa perlu *restart* manual.

### Skenario D: Graceful Degradation pada Fitur Publik
* **Kondisi:** Auth Service berstatus *down* (Circuit Breaker OPEN).
* **Cara Reproduksi:**
  1. Lakukan request ke `GET /items/public`.
* **Expected Behavior:** Fitur yang menggunakan injeksi `get_current_user_optional_degraded` membiarkan akses masuk. Pengunjung tetap bisa melihat daftar item publik tanpa pesan error 500/503.
* **Hasil Test:** **BERHASIL**. Sistem beroperasi dalam mode terdegradasi secara elegan.

---

## 3. Hasil Integration Test Otomatis (Cross-Service)

Tim backend telah menyusun 11 skenario *Integration Test* komprehensif (`tests/integration/test_cross_service.py`) untuk memastikan komunikasi antarlayanan berjalan sempurna.

Untuk menjalankan pengujian ini secara lokal:
```bash
docker compose up -d
pytest tests/integration/ -v
```

**Daftar Pengujian & Status:**
1.  ✅ `test_gateway_health`: Gateway Nginx merespon dengan benar.
2.  ✅ `test_auth_service_health`: Auth Service dapat diakses secara independen.
3.  ✅ `test_library_service_health`: Library Service sehat dan merespon verifikasi *dependency*.
4.  ✅ `test_register_login_flow`: Alur registrasi hingga penerbitan token sukses melewati Gateway.
5.  ✅ `test_get_profile_with_token`: Ekstraksi profil (`/auth/me`) mampu mengurai identitas token.
6.  ✅ `test_cross_service_transaction_auth`: **[KRITIKAL]** Library Service sukses memanggil Auth Service di latar belakang untuk memvalidasi `user_id` sebelum membuat transaksi.
7.  ✅ `test_unauthorized_without_token`: Akses proteksi tanpa token JWT ditolak (HTTP 401/422).
8.  ✅ `test_invalid_token_rejected`: Token manipulasi terdeteksi dan ditolak (HTTP 401).
9.  ✅ `test_get_public_items`: Rute publik memotong proses autentikasi dengan mulus.
10. ✅ `test_get_items_stats_auth_needed_normally`: Mode proteksi normal aktif dan memblokir akses ke rute `/items/stats` tanpa JWT.
11. ✅ `test_get_items_stats_authorized_normally`: Injeksi JWT valid meloloskan pengguna ke statistik.