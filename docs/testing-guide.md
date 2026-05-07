# 🧪 Buku Panduan Testing (LenteraPustaka)

Dokumen ini adalah Standar Operasional Prosedur (SOP) untuk menjalankan, membaca, dan memperbaiki *automated testing* (CI) pada proyek LenteraPustaka.

## 1. Cara Menjalankan Test Secara Lokal
Sebelum melakukan `push` atau `Pull Request`, setiap *developer* **WAJIB** memastikan kodenya lolos pengujian secara lokal di laptop masing-masing.

### A. Testing Backend (Python/FastAPI)
Kita menggunakan `pytest` untuk backend.
1. Buka terminal dan masuk ke folder: `cd backend`
2. Aktifkan *Virtual Environment*: `source venv/Scripts/activate`
3. Jalankan seluruh test: 
   ```bash
   pytest
   ```
4. Untuk melihat tingkat coverage (cakupan kode yang dites):
    ```bash 
    pytest --cov=. --cov-report=term-missing
    ```

### B. Testing Frontend (React/Vite)
Kita menggunakan Vitest untuk frontend.
1. Buka terminal dan masuk ke folder: 
    ```bash
    cd frontend
    ```
2. Jalankan test:
    ```bash
    npm test
    ```

### 2. Cara Membaca Log CI di GitHub Actions
Jika ada Pull Request (PR) yang memiliki status ❌ Failing, lakukan langkah ini:
1. Buka PR tersebut di GitHub.
2. Scroll ke bawah pada bagian Checks, lalu klik tombol Details pada job yang silang merah 
(misal: ``` 🐍 Test Backend ```).
3. Di halaman log, cari langkah (step) yang ditandai dengan ikon ❌ merah (biasanya di step ``` Run tests ```).
4. Klik step tersebut untuk memperluas (expand) terminal log. Baca pesan error di bagian paling bawah log tersebut.

### 3. Panduan Debugging (Mencari Solusi)
Berikut adalah daftar masalah umum (Common CI Failures) dan solusinya:

## 3. Panduan Debugging (Mencari Solusi)
Berikut adalah daftar masalah umum (*Common CI Failures*) dan solusinya:

| Pesan Error | Kemungkinan Penyebab | Solusi |
|---|---|---|
| `ModuleNotFoundError: No module named 'xxx'` | *Library* baru belum dimasukkan ke daftar instalasi. | Tambahkan nama *library* ke `backend/requirements.txt`. |
| `AssertionError` atau `FAILED test_xxx` | Kode fitur berubah sehingga ekspektasi tes tidak lagi cocok. | Perbaiki kode fitur Anda, atau perbarui ekspektasi di file `test_*.py`. |
| `npm ERR! Missing: xxx` | Paket Node.js belum selaras. | Jalankan `npm install` lalu *commit* file `package-lock.json` terbaru. |
| `Error: Process completed with exit code 1` | Perintah di pipeline gagal tereksekusi. | Baca baris log tepat di atas pesan ini untuk melihat *error* aslinya. |

## 4. Aturan Menambahkan Test Baru
Jika Anda (Backend/Frontend) ingin menambahkan skenario tes baru:

- **Backend:** Buat fungsi baru berawalan `test_` di dalam file yang relevan di folder `backend/tests/` (contoh: `test_create_item_empty()`).
- **Frontend:** Tambahkan blok `it('deskripsi test', () => {...})` di dalam file `.test.jsx` yang relevan di folder `frontend/src/components/__tests__/`.
- Pastikan selalu menguji **Edge Cases** (kasus batas/skenario gagal), bukan hanya *Happy Path* (skenario normal yang berhasil).

---
*Disusun oleh: Lead QA & Docs*