"""
Core configuration module.
Uses pydantic-settings to load and validate environment variables.
"""

from functools import lru_cache
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- API Keys ---
    gemini_api_key: str = ""

    # --- Supabase ---
    supabase_url: str = Field(
        default="",
        alias="NEXT_PUBLIC_SUPABASE_URL",
    )
    supabase_key: str = Field(
        default="",
        alias="NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
    )

    # --- CORS ---
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # --- RAG ---
    embedding_model: str = "gemini-embedding-001"
    llm_model: str = "gemini-2.5-flash-lite"
    retrieval_top_k: int = 5

    # .env.local is used for local development; on Vercel, env vars are injected.
    _env_file_path = Path(__file__).resolve().parent.parent.parent.parent / ".env.local"

    model_config = {
        "env_file": str(_env_file_path) if _env_file_path.exists() else None,
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
