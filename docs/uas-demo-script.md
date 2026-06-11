# 🚀 Naskah Demo & Skenario Presentasi UAS - Kelompok Hexacore

**Aplikasi:** LenteraPustaka (Platform Digitalisasi Perpustakaan berbasis Microservices)  
**Durasi Total:** 15 Menit

---

## ⏱️ Menit 00:00 - 03:00 | Pembukaan & Konteks Bisnis
**Pembicara: Muhammad Aqila Ardhi (Lead QA & Docs)**
* **Slide:** Judul, Profil Tim Hexacore, dan Project Overview.
* **Poin Penyampaian:**
    * Memperkenalkan seluruh anggota tim dan aplikasi LenteraPustaka.
    * Menjelaskan latar belakang masalah di perpustakaan fisik (pencarian buku yang tidak efisien, risiko kehilangan data transaksi, dan keterbatasan akses informasi stok buku secara real-time).
    * Memaparkan 3 demografi pengguna utama yang didukung: Guest (Pengunjung Publik), Member (Anggota Terdaftar), dan Admin (Pustakawan).

---

## ⏱️ Menit 03:00 - 06:00 | Arsitektur Sistem & Evolusi Proyek
**Pembicara: Khanza Nabila Tsabita (Lead DevOps)**
* **Slide:** Diagram Arsitektur Microservices (Mermaid) & Tech Stack.
* **Poin Penyampaian:**
    * **Project Journey:** Menjelaskan bagaimana sistem berevolusi dari arsitektur *Monolith* saat UTS menjadi *Microservices* yang sepenuhnya terisolasi untuk UAS.
    * Menjelaskan fungsi **Nginx API Gateway** yang berjalan di port 80 untuk mengarahkan rute secara otomatis ke `/auth/*` (Auth Service) dan `/items/*` (Library Service).
    * Menunjukkan visualisasi *Database Per Service* menggunakan PostgreSQL (`auth_db` pada port 5433 dan `item_db` pada port 5434) untuk memastikan independensi data.

---

## ⏱️ Menit 06:00 - 10:00 | Live Demo Fitur Utama (End-to-End)
**Pembicara: Micka Mayulia Utama (Lead Frontend) & Maulana Malik Ibrahim (Lead Backend)**
* **Aksi Demo:** Layar beralih ke browser menampilkan aplikasi yang sudah live di Railway.
* **Skenario Aplikasi:**
    1.  **Micka (Guest & Member Flow):** Mendemokan pencarian katalog buku tanpa login (Guest), mendaftarkan akun baru, melakukan login, lalu melakukan pengajuan peminjaman buku melalui antarmuka UI.
    2.  **Maulana (Admin Flow & Backend Power):** Login menggunakan akun Admin, masuk ke halaman *Dashboard Statistik*, menyetujui pengajuan peminjaman, lalu memicu *endpoint* `simulate-overdue` untuk mensimulasikan denda keterlambatan secara *real-time*.
    3.  **Micka (Fines Flow):** Kembali ke akun Member untuk menunjukkan denda yang muncul, mengunggah berkas bukti pembayaran denda, dan Admin memverifikasi pelunasan tersebut hingga statusnya berubah menjadi lunas.

---

## ⏱️ Menit 10:00 - 13:00 | Quality Assurance, Keamanan, & CI/CD
**Pembicara: Muhammad Aqila Ardhi (Lead QA & Docs)**
* **Slide:** Dokumen Hasil Pengujian API & Bab Security Hardening.
* **Poin Penyampaian:**
    * **API Testing:** Memaparkan pengujian menyeluruh terhadap seluruh skenario *endpoint* menggunakan Swagger UI yang telah divalidasi dan didokumentasikan.
    * **Integration Test:** Menunjukkan keberhasilan suite pengujian otomatis lintas-layanan (*cross-service testing*) menggunakan skrip `test_cross_service.py` untuk memastikan komunikasi data antar kontainer berjalan mulus.
    * **Security Hardening:** Menjelaskan penerapan *Rate Limiting* (5 req/s pada auth) untuk menghalau *brute force*, validasi kata sandi kuat via *Pydantic*, manajemen rahasia bebas nilai *hardcoded*, serta pelacakan *Structured JSON Logging* menggunakan `correlation_id`.

---

## ⏱️ Menit 13:00 - 15:00 | Kesimpulan & Sesi Tanya Jawab (Retrospective)
**Pembicara: Seluruh Anggota Tim**
* **Slide:** Penutup & Link Repositori GitHub.
* **Poin Penyampaian:**
    * Menyampaikan batasan sistem saat ini (*Known Issues* seperti otomatisasi *cron job* untuk email pengingat yang belum sepenuhnya diimplementasikan).
    * Membuka sesi diskusi, demonstrasi ulang jika diminta, dan tanya jawab dengan dosen penguji.