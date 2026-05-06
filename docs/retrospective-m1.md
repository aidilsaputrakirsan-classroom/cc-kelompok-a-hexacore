# Retrospective — Milestone 1 (LenteraPustaka)

## 🟢 Apa yang Berjalan Baik?
- Implementasi sistem kontainerisasi (*Docker Compose*) berhasil diselesaikan dengan mulus, menyatukan ekosistem Frontend, Backend, dan Database secara harmonis.
- Desain antarmuka pengguna (UI) menggunakan React berjalan sangat baik dan berhasil terhubung (*fetching data*) dengan *endpoint* REST API dari FastAPI.
- Seluruh dokumentasi esensial (Skema Database, Pengujian API, Setup Lingkungan) telah dicatat dengan sangat komprehensif sehingga mempermudah proses pelacakan progres.

## 🔴 Apa yang Perlu Diperbaiki?
> **Catatan Evaluasi (Fase UTS):** Poin-poin di bawah ini merupakan hasil temuan dan evaluasi kinerja tim selama pengerjaan Milestone 1 (periode hingga Ujian Tengah Semester). *Update terbaru: Seluruh kendala, bug antarmuka, dan kekurangan dokumentasi yang tercatat di bawah ini saat ini telah dieksekusi dan berhasil diperbaiki.*

- Masih ditemukan kelolosan *bug* antarmuka (misal: ID Buku yang muncul di tabel transaksi, alih-alih Judul Buku).
- Kerap terjadi bentrokan pengerjaan kode (*conflict*) karena seluruh anggota tim sebelumnya terbiasa melakukan *push* secara langsung ke *branch* `main`.
- Perlunya sinkronisasi yang lebih rutin antara pengembangan Backend dan Frontend untuk mencegah parameter API yang tidak terpakai atau tidak terbaca.
- Belum adanya indikator pemuatan (*loading state* atau *spinner*) saat perpindahan halaman (*routing*) maupun saat *fetching* data, yang dapat mengurangi kenyamanan pengalaman pengguna (UX).
- Daftar *endpoint* API belum tercantum secara eksplisit di dalam file `README.md`, sehingga menyulitkan referensi cepat bagi pengembang maupun penguji.

## 🔵 Action Items untuk Milestone 2
- Menerapkan *Git Workflow* (GitHub Flow) secara ketat, di mana semua pembaruan fitur wajib melalui *Pull Request* (PR) dan persetujuan *Code Review* sebelum di-*merge* ke *main*.
- Memperkuat *Error Handling* di sisi antarmuka untuk memastikan aplikasi tidak *crash* saat menghadapi skenario tak terduga (misal: *server down* atau *input* salah).
- Merapikan seluruh *environment variables* sebagai persiapan krusial menuju fase CI/CD Pipeline dan *Cloud Deployment*.

## 📊 Kontribusi Tim
| Anggota | Peran | Kontribusi Utama | Jumlah Commit |
|---------|-------|------------------|---------------|
| Maulana Malik Ibrahim | Lead Backend | Merancang skema *database*, logika CRUD, manajemen otentikasi, dan validasi *schema* FastAPI. | 53 |
| Micka Mayulia Utama | Lead Frontend | Membangun antarmuka SPA React, integrasi *state management*, dan fungsionalitas *routing* aplikasi. | 20 |
| Khanza Nabila Tsabita | Lead DevOps | Melakukan orkestrasi kontainer menggunakan Docker Compose dan standardisasi *image* aplikasi. | 27 |
| Muhammad Aqila Ardhi | Lead QA & Docs | Melakukan *End-to-End UI/API Testing*, menata struktur *README*, dan menyusun pedoman dokumentasi teknis. | 18 |