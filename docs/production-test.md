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

---
*Diuji oleh: Lead QA & Docs*