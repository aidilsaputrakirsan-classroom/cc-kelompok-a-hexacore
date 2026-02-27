# ☁️ Cloud App - [HEXACORE]

[Deskripsi singkat aplikasi (1-2 paragraf): tuliskan apa yang dilakukan aplikasi ini, untuk siapa target penggunanya, dan masalah apa yang diselesaikannya berdasarkan rekomendasi proyek dari temanmu]

## 👥 Tim

| Nama | NIM | Peran |
|------|-----|-------|
| Maulana Malik Ibrahim | 10231051 | Lead Backend |
| Micka Mayulia Utama | 10231053 | Lead Frontend |
| [Nama Teman 2] | [NIM Teman 2] | Lead DevOps |
| [Nama Teman 3] | [NIM Teman 3] | Lead QA & Docs |

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| FastAPI   | Backend REST API |
| React     | Frontend SPA |
| PostgreSQL | Database |
| Docker    | Containerization |
| GitHub Actions | CI/CD |
| Railway/Render | Cloud Deployment |

## 🏗️ Architecture

```text
[React Frontend] <--HTTP--> [FastAPI Backend] <--SQL--> [PostgreSQL]

## 🤖 Getting Started
Prasyarat
- Python 3.10+
- Node.js 18+
- Git

Backend
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend
```
cd frontend
npm install
npm run dev
```