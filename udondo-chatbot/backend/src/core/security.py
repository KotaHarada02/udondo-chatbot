"""
Security configuration: CORS middleware setup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import get_settings


def configure_cors(app: FastAPI) -> None:
    """Register CORS middleware, restricted to settings.cors_origins.

    The allowed origin list is environment-driven: set the CORS_ORIGINS env var
    to the production frontend URL(s) in production, and it defaults to the
    local Next.js dev server origins otherwise.
    """
    settings = get_settings()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
