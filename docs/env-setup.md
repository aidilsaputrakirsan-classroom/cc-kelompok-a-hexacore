# 🌐 Environment Configuration - Lead DevOps

📋 **Tugas Lead DevOps - Modul 3**

Dokumentasi mengenai standardisasi konfigurasi lingkungan (environment variables) untuk frontend **LenteraPustaka**.

## ✅ Yang Sudah Dikerjakan

### 1. Membuat File `.env`
#### a. File: `frontend/.env`
```
VITE_API_URL=http://localhost:8000
```
#### b.File: `frontend/.env.example`
```
VITE_API_URL=http://localhost:8000
```

### 2. Update `frontend/src/services/api.js`
```
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
```

### 3. Update `frontend/.gitignore`
```
# --- Environment Variables ---
.env                # Mengabaikan .env di folder utama
frontend/.env       # Mengabaikan .env di folder frontend (Spesifik)
backend/.env        # Mengabaikan .env di folder backend (Spesifik)
*.local             # Mengabaikan semua file konfigurasi lokal tambahan
```

_Source_ : [frontend/src/services/api.js](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-hexacore/blob/main/frontend/src/services/api.js) | [frontend/.env.example](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-hexacore/blob/main/frontend/.env.example) | [frontend/.gitignore](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-hexacore/blob/main/frontend/.gitignore)