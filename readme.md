# ☁️ Cloud App - [HEXACORE]

[Deskripsi singkat aplikasi (1-2 paragraf): tuliskan apa yang dilakukan aplikasi ini, untuk siapa target penggunanya, dan masalah apa yang diselesaikannya berdasarkan rekomendasi proyek dari temanmu]

## 👥 Tim

| Nama | NIM | Peran |
|------|-----|-------|
| Maulana Malik Ibrahim | 10231051 | Lead Backend |
| Micka Mayulia Utama | 10231053 | Lead Frontend |
| Khanza Nabila Tsabita | 10231049 | Lead DevOps |
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
```

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

## 📅 Roadmap

| Minggu | Target | Status |
|--------|--------|--------|
| 1 | Setup & Hello World | ✅ |
| 2 | REST API + Database | ⬜ |
| 3 | React Frontend | ⬜ |
| 4 | Full-Stack Integration | ⬜ |
| 5-7 | Docker & Compose | ⬜ |
| 8 | UTS Demo | ⬜ |
| 9-11 | CI/CD Pipeline | ⬜ |
| 12-14 | Microservices | ⬜ |
| 15-16 | Final & UAS | ⬜ |

## Project Structure
```
CC-KELOMPOK-A-HEXACORE/
├── backend/
│   ├── main.py
│   ├── requirements.txt
├── docs/ 
│   ├── member-aqila.md
│   ├── member-Khanza_Nabila_Tsabita.md
│   ├── member-Maulana_Malik_Ibrahim.md
│   ├── member-Micka_Mayulia_Utama.md
├── frontend/  
│   ├── frontend/
│   ├── node_modules/
│   ├── public/    
│   └── src/   
├── .gitignore            
└── README.md
```