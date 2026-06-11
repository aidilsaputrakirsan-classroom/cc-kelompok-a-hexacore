# UAS Presentation Outline

## Slide 1: Title (🎤 Speaker: Aqila - Lead QA & Docs | Durasi: 0.5 menit)
- Nama proyek: LenteraPustaka
- Nama tim: Hexacore
- Anggota: 
  - Maulana Malik Ibrahim (Lead Backend)
  - Micka Mayulia Utama (Lead Frontend)
  - Khanza Nabila Tsabita (Lead DevOps)
  - Muhammad Aqila Ardhi (Lead QA & Docs)

## Slide 2: Problem & Solution (🎤 Speaker: Aqila - Lead QA & Docs | Durasi: 1 menit)
- Masalah yang diselesaikan: Pencarian buku yang inefisien, risiko kehilangan data pencatatan manual, dan sulit mengecek ketersediaan stok secara *real-time*.
- Target pengguna: Pengunjung Publik (_Guest_), Anggota Terdaftar (_Member_), dan Pustakawan (_Admin_).
- Solusi: Platform perpustakaan digital "LenteraPustaka" berbasis web untuk mendigitalisasi proses katalog, peminjaman, dan tugas administratif admin, didukung arsitektur *microservices* untuk skalabilitas.

## Slide 3: Architecture Journey (🎤 Speaker: Khanza - Lead DevOps | Durasi: 2 menit)
- Week 1-4: Monolith (1 backend FastAPI, 1 DB PostgreSQL, React Frontend) → [React Frontend] 
```text
[React Frontend] <--HTTP--> [FastAPI Backend] <--SQL--> [PostgreSQL]
       |                            |
  Vite + JSX               REST API Endpoints
(Port 3000/5173)              (Port 8000)
```

- Week 5-7: Containerized (Docker Compose) → [diagram Docker monolith]

- Week 9-11: CI/CD (GitHub Actions + Railway) → [screenshot workflow CI/CD badge & Railway live]

- Week 12-14: Microservices (2 services FastAPI + 2 DB + 1 Nginx Gateway + Frontend) → [diagram arsitektur microservices akhir]


## Slide 4: Tech Stack & Infrastructure (🎤 Speaker: Khanza - Lead DevOps | Durasi: 2 menit)
- Diagram arsitektur final: [Diagram: Frontend -> Nginx Gateway -> Auth Service & Library Service -> Auth DB & Item DB]
- Jumlah containers, services, endpoints: 
  - 6 Containers (`frontend`, `gateway`, `auth-service`, `library-service`, `auth-db`, `item-db`)
  - 4 Services Utama (React Frontend, Nginx Gateway, 2 FastAPI Backend)
  - ~29 Endpoints (Users, Books, Categories, Transactions, Fines, System Health)
- CI/CD pipeline flow: GitHub Actions (`make lint`, `make test`) → Build Docker Image / Deploy ke Railway
- Monitoring & observability: Endpoint `/system/health` dan *structured logging* Docker (format JSON).

## Slide 5: Live Demo (🎤 Speaker: Maulana & Micka | Durasi: 3 menit)
- **Skenario Pembagian Peran Demo:**
  - **Micka (Frontend):** Bertugas sebagai *driver* (berbagi layar/menjalankan aplikasi) dan menjelaskan alur UI/UX secara langsung.
  - **Maulana (Backend):** Memberikan sisipan narasi teknis (*backend insight*) terkait komunikasi antar-servis yang terjadi saat Micka melakukan klik/aksi.
- **Detail Flow:**
  1. **Open App & Register:**
     - *Micka:* Menampilkan halaman beranda publik, lalu mendemokan fitur daftar akun (*Register*).
     - *Maulana:* "Di balik layar, Nginx Gateway meneruskan form ini ke *Auth Service*, yang kemudian mem-hash password dan menyimpannya ke *Auth DB*."
  2. **Login & View Items (Katalog Buku):**
     - *Micka:* Login dengan email tadi, lalu menampilkan daftar buku.
     - *Maulana:* "Login sukses membuahkan token JWT. Nginx memvalidasi *header* tersebut dan meneruskan akses menu buku ke *Library Service*."
  3. **Create & Update (Peminjaman Buku):**
     - *Micka:* Mendemokan transaksi peminjaman (Create) dan mendemokan perubahan/update stok buku yang berkurang.
     - *Maulana:* "*Library Service* mengonfirmasi ketersediaan dan memodifikasi *Item DB* secara terisolasi, memastikan tidak ada tabrakan dengan *state* Auth."
  4. **Delete Item & Halaman Status:**
     - *Micka:* Mendemokan fitur hapus buku, kemudian beralih menunjukkan navigasi halaman monitoring sistem `/status`.
     - *Maulana:* "Halaman status memvalidasi kesehatan (*health check*) seluruh layanan. Kode 200 OK berarti Gateway, Auth, dan Library merespons secara optimal."
- **Backup:** Rekaman video demonstrasi lengkap telah disiapkan (untuk antisipasi apabila terjadi kendala jaringan).

## Slide 6: Challenges & Lessons Learned (🎤 Speaker: Semua Anggota / Round-robin | Durasi: 1.5 menit)
Bagian ini dibacakan secara estafet (*round-robin*) sesuai dengan domain kendala masing-masing:

- **Maulana (Lead Backend):** 
  - *Challenge:* Memecah satu database monolith raksasa menjadi 2 DB terpisah (*Auth* dan *Item/Library*) tanpa memutus relasi data.
  - *Solution:* Melakukan refaktor skema ORM, menghilangkan *hard-relation*, dan memisahkan koneksi PostgreSQL per *service*.
- **Micka (Lead Frontend):**
  - *Challenge:* Mengubah integrasi sistem agar *Frontend* (React) dapat mengonsumsi berbagai layanan *backend* tanpa harus memanggil port yang berbeda-beda.
  - *Solution:* Menyesuaikan rute pemanggilan API *(fetch)* ke satu pintu Nginx Gateway, serta memperbaiki *error handling UI* lintas-layanan.
- **Khanza (Lead DevOps):**
  - *Challenge:* Kompleksitas komunikasi lintas-kontainer (Docker) dan sinkronisasi rahasia (*environment variables*) antara lokal dan *production*.
  - *Solution:* Menggunakan Nginx sebagai *reverse proxy* penyatu dan mengatur `docker-compose.yml` yang terpusat.
- **Aqila (Lead QA & Docs) — Biggest Learning:**
  - *Kesimpulan Pelajaran:* "Pelajaran terbesar dari tim Hexacore adalah menyadari *trade-off* *microservices*. Keunggulan skalabilitas dan isolasinya sangat hebat, namun mengorbankan kesederhanaan. Ini menuntut tim kami untuk super disiplin menjaga dokumentasi, menguji kontrak API, dan melakukan *deployment*."

## Slide 7: Team Contributions (🎤 Speaker: Semua Anggota / Round-robin | Durasi: 1.5 menit)
- Maulana Malik Ibrahim — Lead Backend — Pemecahan FastAPI ke *microservices*, skema *database*, logika bisnis *endpoint* API — [63 commits, 11 PRs]
- Micka Mayulia Utama — Lead Frontend — Integrasi React UI dengan Nginx Gateway, implementasi halaman status, perbaikan UI/UX — [28 commits, 8 PRs]
- Khanza Nabila Tsabita — Lead DevOps — Setup kontainerisasi (Docker/Compose), Nginx Gateway, CI/CD Pipeline ke Railway — [45 commits, 19 PRs]
- Muhammad Aqila Ardhi — Lead QA & Docs — Uji coba API (Swagger/Thunder Client), *API Contract*, rilis dokumentasi, dan ERD — [24 commits, 9 PRs]

## Demo Script (Skenario Perekaman Video)

**Persiapan Awal:** Pastikan aplikasi sudah berjalan lokal (*Docker*) dan siapkan *tab* GitHub repositori Anda di *browser*.

1. **Akses Beranda (Open App):**
   - **Aksi:** Buka browser dan akses `http://localhost:3000`.
   - **Penjelasan:** "Ini halaman utama LenteraPustaka. Pengunjung biasa dapat mencari buku di katalog tanpa harus login."

2. **Registrasi Akun Baru (Register):**
   - **Aksi:** Klik "Daftar". Isi formulir dengan peran `member`, dan perlihatkan bahwa sistem menolak jika *password* terlalu lemah. Setelah itu, daftar dengan *password* yang valid.
   - **Penjelasan:** "Kami mendemokan pendaftaran akun. *Auth Service* memvalidasi format data dan menyimpan *password* dalam bentuk *hash* secara aman."

3. **Autentikasi Pengguna (Login):**
   - **Aksi:** Masuk ke menu Login, ketik email dan *password* yang baru didaftarkan.
   - **Penjelasan:** "Gateway meneruskan *request* ini ke *Auth Service*. Setelah validasi sukses, *frontend* menerima token JWT untuk memulai sesi."

4. **Manajemen Katalog (Create & View Items):**
   - **Aksi:** Login dengan akun Pustakawan (Admin). Buka fitur tambah buku, isi form (Judul, ISBN, Stok), dan klik Simpan. Kembali ke halaman utama untuk melihat buku tersebut.
   - **Penjelasan:** "Ini adalah bukti fitur *Create* berjalan. Data yang di-input akan dikelola langsung oleh *Library Service* dan disimpan ke *Item Database* yang terpisah dari *Auth Database*."

5. **Peminjaman Buku (Simulasi Transaksi):**
   - **Aksi:** Login menggunakan akun Member. Lakukan "Pinjam Buku" pada buku yang baru dibuat tadi.
   - **Penjelasan:** "Member melakukan transaksi peminjaman. Sistem kami otomatis mengkalkulasi pengurangan stok buku dan mencatat histori transaksinya."

6. **Pembaruan & Penghapusan (Update & Delete Items):**
   - **Aksi:** (Akun Admin) Buka detail buku, ubah data stoknya (*Update*). Setelah tersimpan, tekan tombol Hapus (*Delete*) untuk buku percobaan tersebut.
   - **Penjelasan:** "Fitur Edit dan Hapus membuktikan API berfungsi penuh. Walaupun *microservices*, integrasinya dari UI sangat mulus berkat Nginx Gateway."

7. **Monitoring Sistem (Cek Halaman Status):**
   - **Aksi:** Buka fitur/tab "Halaman Status" (atau *hit endpoint* `/system/health`).
   - **Penjelasan:** "Ini adalah *dashboard health-check*. Memastikan bahwa baik *Auth Service*, *Library Service*, beserta kedua PostgreSQL berjalan sehat (Healthy)."

8. **Bukti Automasi CI/CD (Show CI/CD Badge):**
   - **Aksi:** Pindah ke *tab* repositori GitHub. Tunjukkan *badge* hijau "passing", klik tab "Actions" untuk melihat riwayat *pipeline*.
   - **Penjelasan:** "Di repositori GitHub, setiap kode yang di-*push* akan melewati automasi *testing* dan *linting* menggunakan GitHub Actions."

9. **Pembuktian Log Arsitektur (Structured Logs):**
   - **Aksi:** Buka Terminal proyek Anda. Jalankan `docker compose ps` (memperlihatkan status kontainer `Up`), lalu `docker compose logs --tail=20 gateway`.
   - **Penjelasan:** "Sebagai penutup, ini bukti nyata implementasi *microservices* kontainer kami. Lalu lintas antar layanan terekam di terminal secara *real-time*."
