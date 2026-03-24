"""
FastAPI Application Entry Point.
Registers middleware, routers, and startup events.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.core.security import configure_cors
from src.api.v1.chat import router as chat_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle."""
    logger.info("🚀 Starting udondo-chatbot backend (Supabase RAG)...")
    yield
    logger.info("👋 Shutting down udondo-chatbot backend...")


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title="Udondo Chatbot API",
        description="Multi-language RAG Chatbot powered by Supabase & Gemini",
        version="0.2.0",
        lifespan=lifespan,
    )

    # Security
    configure_cors(app)

    # Routes
    app.include_router(chat_router)

    return app


app = create_app()
