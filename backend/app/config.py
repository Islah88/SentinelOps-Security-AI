"""SentinelOps — Application Configuration (Pydantic Settings)."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Central configuration loaded from environment variables."""

    # --- App ---
    APP_NAME: str = "SentinelOps API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # --- Database ---
    DATABASE_URL: str = "sqlite:///./sentinelops.db"

    # --- Security ---
    JWT_SECRET: str = "sentinelops-dev-secret-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24h

    # --- AI / LLM ---
    GEMINI_API_KEY: str = ""
    AI_MODEL: str = "gemini-2.5-flash"

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:3002,http://localhost:3003"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
