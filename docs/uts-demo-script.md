# UTS Demo Script — Cloud Team Hexacore (LenteraPustaka)

## 1. Setup (2 menit)
- Buka terminal di root project `cc-kelompok-a-hexacore`.
- Jalankan `make up` atau `docker compose up -d`.
- Jalankan `docker compose ps` → tunjukkan 3 services (db, backend, frontend) dalam status *healthy* atau *Up*.

## 2. Frontend Demo (5 menit)
- Buka http://localhost:3000 di browser.
- Tunjukkan halaman utama LenteraPustaka.
- Register user/member baru (tunjukkan form validation berfungsi).
- Login menggunakan akun tersebut → masuk ke main app.
- Create 3 items (tambahkan data buku baru, tunjukkan form dan response).
- Edit 1 item buku (tunjukkan pre-filled form).
- Search item (gunakan fitur pencarian buku).
- Delete 1 item buku (tunjukkan confirm dialog).

## 3. Backend Demo (3 menit)
- Buka http://localhost:8000/docs (Swagger UI).
- Tunjukkan semua endpoints API LenteraPustaka terdokumentasi dengan rapi.
- Test `/system/health` endpoint untuk mengecek status.
- Tunjukkan *auth flow* (proses login/mendapatkan token JWT) langsung di Swagger.

## 4. Docker Demo (3 menit)
- Di terminal, jalankan `docker compose ps` → lihat status saat ini.
- Jalankan `docker compose down` → semua kontainer stop.
- Jalankan `docker compose up -d` → semua kontainer start lagi.
- Buka browser dan Login kembali → tunjukkan data buku masih ada (bukti keberhasilan *volume persistence* pada `lentera_data`).
- Jalankan `docker compose logs backend` → tunjukkan logs aktivitas backend.
- *(Opsional)* Simulasikan *crash* dengan `docker compose exec backend sh -c "kill 1"`, lalu jalankan `docker compose ps` untuk membuktikan fitur auto-restart berfungsi.

## 5. Code Walkthrough (2 menit)
- Buka dan tunjukkan file `docker-compose.yml` (jelaskan bagian services, konfigurasi networks, volumes, dan fungsi *healthcheck*).
- Tunjukkan `backend/Dockerfile` (jelaskan instalasi *dependencies*).
- Tunjukkan `frontend/Dockerfile` (jelaskan konsep *multi-stage build* menggunakan Nginx).

## Total Estimasi: ~15 menit