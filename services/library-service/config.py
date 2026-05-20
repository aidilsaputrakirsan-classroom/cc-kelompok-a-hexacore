import os
from dotenv import load_dotenv

# Load .env (useful for local development)
load_dotenv()

class Settings:
    """Konfigurasi terpusat Library Service, membaca dari environment variables dengan nilai default."""
    
    # 1. Environment & Debug
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = ENVIRONMENT == "development"
    
    # 2. Database (Database per service: item_db)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5434/item_db"
    )
    
    # 3. Communication
    AUTH_SERVICE_URL: str = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")
    
    # 4. CORS
    _cors_env: str = os.getenv("ALLOWED_ORIGINS", "http://localhost,http://localhost:5173")
    CORS_ORIGINS: list = [o.strip() for o in _cors_env.split(",") if o.strip()]
    
    # 5. Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "DEBUG" if DEBUG else "INFO")

settings = Settings()
