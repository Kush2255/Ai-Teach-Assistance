import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "AI Teacher"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DATABASE_URL: str = "sqlite:///./ai_teacher.db"
    DATA_DIR: str = "./data"
    
    # LLM API Keys
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    DEFAULT_LLM_PROVIDER: str = "gemini"
    
    # Video Avatar API Keys
    HEYGEN_API_KEY: Optional[str] = None
    DID_API_KEY: Optional[str] = None
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.DATA_DIR, "uploads"), exist_ok=True)
os.makedirs(os.path.join(settings.DATA_DIR, "vector_db"), exist_ok=True)
