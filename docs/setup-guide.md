# 📖 Setup Guide: LenteraPustaka (Hexacore)
Panduan ini berisi langkah-langkah lengkap untuk menjalankan proyek LenteraPustaka dari nol hingga siap digunakan di lingkungan lokal.

## 🛠️ 1. Prasyarat Sistem
Pastikan perangkat Anda sudah terpasang:
- Python 3.10+ (Centang "Add to PATH" saat instalasi Windows).
- Node.js 18+ (LTS) & npm.
- PostgreSQL (Status: Running).
- Git.

## 🚀 2. Persiapan Awal (Clone)
```bash
git clone https://github.com/username/cc-kelompok-a-hexacore.git
cd cc-kelompok-a-hexacore
```

## 🏗️ 3. Konfigurasi Backend (FastAPI)
#### a. Masuk ke folder & Virtual Env:
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Linux/Mac: source venv/bin/activate
```
#### b. Instal Dependencies:
```Bash
pip install -r requirements.txt
```

#### c. Konfigurasi .env:
- Salin template: `cp .env.example .env`
- Buka file `.env` dan sesuaikan:
```bash
DATABASE_URL: Isi dengan password PostgreSQL Anda dan nama database lentera_pustaka.

SECRET_KEY: Generate key baru dengan perintah python -c "import secrets; print(secrets.token_hex(32))".

ALLOWED_ORIGINS: Pastikan berisi http://localhost:5173.
```
### 💡 Generate random secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

#### d. Menyiapkan Database:
Buka psql atau pgAdmin, lalu jalankan: `CREATE DATABASE lentera_pustaka;`

#### e. Running Server:
```Bash
uvicorn main:app --reload --port 8000
```

## 💻 4. Konfigurasi Frontend (React + Vite)
#### a. Masuk ke folder & Instalasi:
```Bash
cd ../frontend
npm install
# Pastikan library recharts terinstal
npm install recharts
```

#### b. Konfigurasi `.env`:
- Salin template: `cp .env.example .env`
- Pastikan isinya: `VITE_API_URL=http://localhost:8000`

#### c. Running Frontend:
```Bash
npm run dev
```

## 🧪 5. Verifikasi & Testing
- Akses Web: http://localhost:5173
- Cek Dokumentasi API: http://localhost:8000/docs (Swagger UI)

### 💡 Tips Pro DevOps:
Jika Anda ingin cara cepat, jalankan script otomatisasi yang sudah disediakan:
```Bash
./setup.sh
# (Catatan: Pastikan Anda memberikan izin eksekusi dengan chmod +x setup.sh di Linux/Mac)
```