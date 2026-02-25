from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Cloud App API",
    description="API untuk mata kuliah Komputasi Awan",
    version="0.1.0"
)

# CORS - agar frontend bisa akses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Untuk development saja
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Hello from Cloud App API!",
        "status": "running",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/team")
def team_info():
    return {
        "team": "cloud-team-XX",
        "members": [
            # TODO: Isi dengan data tim Anda
            {"name": "Maulana Malik Ibrahim", "nim": "10231051", "role": "Lead Backend"},
            {"name": "Micka Mayulia Utama", "nim": "10231053", "role": "Lead Frontend"},
            {"name": "Khanza Nabila Tsabita", "nim": "10231049", "role": "Lead DevOps"},
            {"name": "Muhammad Aqila Ardhi", "nim": "10231057", "role": "Lead QA & Docs"},
        ]
    }