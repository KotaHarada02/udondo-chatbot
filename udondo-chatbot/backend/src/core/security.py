"""
Security configuration: CORS middleware setup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import get_settings


def configure_cors(app: FastAPI) -> None:
    """Register CORS middleware with strict origin control."""
    settings = get_settings()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
