# Laporan Pengujian E2E (Autentikasi) - Modul 4

Berikut adalah dokumentasi hasil pengujian fitur Autentikasi dan Otorisasi (JWT) yang telah dilakukan pada sistem. Seluruh *test case* utama berjalan dengan sukses.

| ID Test | Deskripsi Pengujian | Hasil | Dokumentasi |
| :--- | :--- | :---: | :--- |
| **TC-AUTH-01** | Verifikasi proteksi Halaman Login | ✅ Berhasil | ![TC-AUTH-01](test/TC-AUTH-01-login-page.png) |
| **TC-AUTH-02** | Proses Registrasi User Baru | ✅ Berhasil | ![TC-AUTH-02](test/TC-AUTH-02-regist-page.png) |
| **TC-AUTH-04** | Verifikasi Auto-Login Dashboard | ✅ Berhasil | ![TC-AUTH-04](test/TC-AUTH-04-dashboard-success.png) |
| **TC-AUTH-05** | Verifikasi Header & Info User | ✅ Berhasil | ![TC-AUTH-05](test/TC-AUTH-05-User.png) |
| **TC-AUTH-06** | Uji Operasi CRUD (Pinjam Buku) | ✅ Berhasil | ![TC-AUTH-06](test/TC-AUTH-06-Pinjam.png) |
| **TC-AUTH-07** | Terminasi Sesi (Proses Logout) | ✅ Berhasil | ![TC-AUTH-07](test/TC-AUTH-07-Logout.png) |
| **TC-AUTH-09** | Validasi Akses (Login Ulang) | ✅ Berhasil | ![TC-AUTH-09](test/TC-AUTH-09-LoginUlang.png) |
| **TC-AUTH-10** | Verifikasi Persistensi Data | ✅ Berhasil | ![TC-AUTH-10](test/TC-AUTH-10-Data.png) |