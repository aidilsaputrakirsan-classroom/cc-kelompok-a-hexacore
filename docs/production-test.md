# 🧪 Laporan Production Testing (Smoke Test)

Dokumen ini berisi hasil pengujian fitur utama aplikasi LenteraPustaka setelah di-deploy ke environment Production (Railway).

## 1. URL Production
- **Frontend:** `https://frontend-production-78efa.up.railway.app/`
- **Backend / API:** `https://backend-production-3084.up.railway.app/docs`
- **Backend Health:** `https://backend-production-3084.up.railway.app/health`

## 2. Hasil Smoke Test

| Skenario Pengujian | Environment Development (Lokal) | Environment Production (Railway) | Status Akhir |
|---|:---:|:---:|:---:|
| Backend GET `/health` | ✅ Pass | ✅ Pass | Pass |
| Register user baru | ✅ Pass | ✅ Pass | Pass |
| Login dengan user tersebut | ✅ Pass | ✅ Pass | Pass |
| Create item baru | ✅ Pass | ✅ Pass | Pass |
| Read daftar items | ✅ Pass | ✅ Pass | Pass |
| Update (Edit) item | ✅ Pass | ✅ Pass | Pass |
| Delete (Hapus) item | ✅ Pass | ✅ Pass | Pass |

### 3. Production Issues

Berikut adalah beberapa kendala yang terjadi saat aplikasi berada di production beserta solusinya:

| Gejala | Penyebab | Solusi |
|---|---|---|
| CORS error di browser console | `CORS_ORIGINS` tidak sesuai URL frontend | Update env var di Railway |
| `502 Bad Gateway` | Backend crash / port salah | Cek deploy logs, pastikan `PORT` env var |

---
*Diuji oleh: Lead QA & Docs*