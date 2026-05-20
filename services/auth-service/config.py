import os
from dotenv import load_dotenv

# Load .env (useful for local development)
load_dotenv()

class Settings:
    """Konfigurasi terpusat Auth Service, membaca dari environment variables dengan nilai default."""
    
    # 1. Environment & Debug
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = ENVIRONMENT == "development"
    
    # 2. Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5433/auth_db"
    )
    
    # 3. Authentication (JWT)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-key-for-development")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    
    # 4. CORS
    _cors_env: str = os.getenv("ALLOWED_ORIGINS", "http://localhost,http://localhost:5173")
    CORS_ORIGINS: list = [o.strip() for o in _cors_env.split(",") if o.strip()]
    
    # 5. Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "DEBUG" if DEBUG else "INFO")

settings = Settings()
