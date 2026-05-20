# Deployment Guide

## Railway Setup
1. Login ke Railway via GitHub
2. Buat project baru
3. Tambah PostgreSQL database service
4. Deploy backend (root: `/backend`)
5. Deploy frontend (root: `/frontend`)

## Environment Variables

### Backend (Railway)
| Variable | Contoh Value |
|----------|-------------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `SECRET_KEY` | *(random hex 64 chars)* |
| `ALLOW_ORIGINS` | `https://frontend-production-78efa.up.railway.app/` |
| `ENVIRONMENT` | `production` |

### Frontend (Railway)
| Variable | Contoh Value |
|----------|-------------|
| `VITE_API_URL` | `https://backend-production-3084.up.railway.app/docs` |

### GitHub Secrets
| Secret | Keterangan |
|--------|-----------|
| `RAILWAY_TOKEN` | Token sakti dari railway.app/account/tokens untuk auto-deploy |

## Troubleshooting (Masalah Umum)
* **CORS Error di Browser:** Pastikan variabel `CORS_ORIGINS` di backend sudah sama persis dengan URL frontend yang aktif.
* **Aplikasi Blank / 502 Bad Gateway:** Cek tab "Deploy Logs" di dashboard Railway untuk melihat proses *build* yang gagal.
* **Gagal Login / Token Error:** Pastikan `SECRET_KEY` sudah terisi dan konsisten di menu Variables Railway.
