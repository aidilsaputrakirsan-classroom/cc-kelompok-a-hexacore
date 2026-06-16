# ✅ Final UAS Readiness Checklist

**Proyek:** LenteraPustaka (Microservices)  
**Tanggal Pengecekan:** 11 Juni 2026  
**Diperiksa Oleh:** Muhammad Aqila Ardhi (Lead QA & Docs)

Dokumen ini adalah daftar periksa final untuk memastikan seluruh komponen sistem dan kesiapan tim telah memenuhi standar pengujian sebelum demonstrasi Ujian Akhir Semester (UAS).

---

## 1. Kesiapan Sistem & Deployment (DevOps & Backend)
- [✅] **Railway Production URL:** Aplikasi dapat diakses tanpa *error* 502/503.
- [✅] **API Gateway (Nginx):** Rute `/auth` dan `/items` berhasil diteruskan ke *service* yang tepat.
- [✅] **Database Terisolasi:** `auth_db` dan `item_db` berjalan independen dan terkoneksi.
- [✅] **Environment Variables:** Seluruh *secrets* (JWT key, DB URL) aman di `.env` (tidak ada *hardcode*).
- [✅] **CI/CD Pipeline:** GitHub Actions berstatus *Passed* pada *commit* terakhir di cabang `main`.

## 2. Fungsionalitas Aplikasi (Frontend & UI/UX)
- [✅] **Auth Flow:** Registrasi, Login, dan Logout berfungsi dengan mulus.
- [✅] **Katalog Buku:** Pengunjung publik (Guest) dapat melihat daftar buku tanpa harus *login*.
- [✅] **Sirkulasi Transaksi:** Member dapat meminjam buku, dan Admin dapat menyetujuinya.
- [✅] **Simulasi Denda:** Admin dapat memicu denda keterlambatan (`simulate-overdue`).
- [✅] **Pembayaran Denda:** Member dapat mengunggah bukti pembayaran, dan Admin dapat memverifikasi.
- [✅] **Responsivitas Layar:** Tampilan antarmuka tidak rusak saat dibuka di ukuran layar yang berbeda.

## 3. Dokumentasi & Quality Assurance (QA & Docs)
- [✅] **README Utama:** Tautan Live Demo, *Project Structure*, dan *Getting Started* sudah akurat (Microservices update).
- [✅] **Release Notes M3:** Dokumen `release-notes-m3.md` sudah mencantumkan fitur baru dan perbaikan *bug*.
- [✅] **API Documentation:** Swagger UI dapat diakses via rute Railway terbaru.
- [✅] **Integration Testing:** Skrip `test_cross_service.py` berhasil dijalankan tanpa *error* merah.

## 4. Kesiapan Presentasi Tim
- [✅] **Slide Presentasi:** 5-7 slide sudah siap (Tanggung jawab Frontend).
- [✅] **Naskah Demo:** Skenario urutan klik aplikasi sudah diuji coba agar tidak ada *error* tak terduga saat live.
- [✅] **Persiapan Q&A Backend:** Siap menjawab alasan penggunaan FastAPI, komunikasi antar-*service*, dan mitigasi *downtime*.
- [✅] **Persiapan Q&A DevOps:** Siap menjelaskan alur CI/CD dari GitHub ke Railway dan strategi skalabilitas.