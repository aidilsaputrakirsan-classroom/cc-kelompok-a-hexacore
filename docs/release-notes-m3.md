# 🚀 Release Notes - LenteraPustaka v3.0.0 (Milestone 3)

**Tanggal Rilis:** 11 Juni 2026  
**Fokus Utama:** Transisi Microservices, Keamanan (Security Hardening), dan Manajemen Sirkulasi.

Selamat datang di rilis final LenteraPustaka untuk Ujian Akhir Semester! Pada pembaruan v3.0.0 ini, kami telah melakukan perombakan fundamental pada arsitektur sistem. Monolith telah bertransformasi menjadi Microservices yang tangguh, dilindungi oleh Nginx API Gateway, dan dilengkapi dengan fitur manajemen perpustakaan yang lebih mendalam.

---

## 🎉 Fitur Baru (New Features)

* **Arsitektur Microservices:** Sistem kini dipecah menjadi dua layanan independen, yaitu `Auth Service` (menangani pengguna & JWT) dan `Library Service` (menangani katalog, sirkulasi, dan denda).
* **Nginx API Gateway:** Seluruh lalu lintas (trafik) kini masuk melalui satu pintu gerbang terpusat di *port* 80, menyederhanakan komunikasi antara *Frontend* dan *Backend*.
* **Sistem Manajemen Denda (`/fines`):** Pengguna kini dapat melihat denda berjalan, mengunggah bukti pembayaran pelunasan, dan Admin dapat memverifikasi pembayaran tersebut.
* **Simulasi Keterlambatan (*Overdue Simulator*):** Penambahan *endpoint* khusus (`simulate-overdue`) untuk memudahkan pengujian batas waktu peminjaman buku tanpa harus menunggu waktu nyata.
* **Dukungan Unggah Berkas (*File Upload*):** Penambahan fitur unggah sampul buku (`/upload/covers`) dan bukti pembayaran denda (`/upload/fines`).

---

## 🛡️ Peningkatan Keamanan & Performa (Security & Performance)

* **Implementasi Rate Limiting:** Gateway kini membatasi lonjakan *request* (`5 req/s` untuk autentikasi, `20 req/s` untuk API umum) guna menangkis serangan *Brute Force* dan DDoS.
* **Manajemen Rahasia (*Secrets Management*):** Menghapus seluruh kredensial statis (*hardcoded*) di dalam kode. Seluruh variabel sensitif kini dikelola dengan aman melalui `.env` dan *Railway Variables*.
* **Observabilitas & Logging:** Penerapan *Structured JSON Logging* terpusat yang dilengkapi dengan pelacakan `correlation_id` untuk memudahkan investigasi *error* lintas-layanan.
* **Validasi Pydantic Lapis Kedua:** Pengetatan aturan pembuatan *password* (wajib mengandung kombinasi huruf besar/kecil, angka, dan karakter spesial).

---

## 🔧 Perbaikan Kutu & Pembersihan (Bug Fixes & Refactoring)

* **Resolusi Tautan Produksi:** Memperbaiki *bug* kegagalan koneksi di *Frontend* dengan memperbarui konfigurasi URL API `cefb` di dalam `.env.production`.
* **Perbaikan Tampilan Antarmuka UI:** Menyelesaikan masalah tata letak input (*field display errors*) yang sebelumnya terpotong pada layar resolusi tertentu setelah tahap *midterm*.
* **Optimalisasi Indikator Pemuatan (*Loading State*):** Memperbaiki *bug* indikator pemuatan yang hilang (*missing loading indicators*) saat proses pengambilan data katalog yang berat, sehingga UX menjadi lebih responsif.
* **Standardisasi Respons API:** Merapikan struktur respons JSON agar konsisten mengembalikan detail `message`, `data`, dan `status_code` di seluruh *endpoint*.

---

## ⚠️ Catatan Tersisa (Known Issues)

* **Notifikasi Email:** Sistem pengingat pengembalian buku saat ini masih mengandalkan pengecekan manual di *dashboard*. Pengiriman email otomatis (*cron job*) belum sepenuhnya diimplementasikan pada rilis ini.
* **Skalabilitas Database:** Meskipun layanan sudah dipisah secara logika, saat ini kedua layanan masih berbagi *resource server database* yang sama di Railway. Perlu pemisahan klaster basis data (*database clustering*) untuk beban produksi skala besar.

---
*Dibuat oleh Tim QA & Docs Hexacore.*