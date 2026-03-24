"""
FastAPI Dependency Injection — wires concrete adapters to abstract ports.
This is the composition root of the application.
"""

from functools import lru_cache

from src.core.config import get_settings
from src.infrastructure.llm.gemini_adapter import GeminiAdapter
from src.infrastructure.supabase.supabase_knowledge_retriever import SupabaseKnowledgeRetriever
from src.infrastructure.supabase.supabase_chat_log_adapter import SupabaseChatLogAdapter
from src.application.chat_service import ChatService


@lru_cache()
def get_llm_adapter() -> GeminiAdapter:
    """Create and cache the Gemini LLM adapter."""
    settings = get_settings()
    return GeminiAdapter(
        api_key=settings.gemini_api_key,
        model_name=settings.llm_model,
    )


@lru_cache()
def get_retriever_adapter() -> SupabaseKnowledgeRetriever:
    """Create and cache the Supabase knowledge retriever adapter."""
    settings = get_settings()
    return SupabaseKnowledgeRetriever(
        supabase_url=settings.supabase_url,
        supabase_key=settings.supabase_key,
        gemini_api_key=settings.gemini_api_key,
        embedding_model=settings.embedding_model,
    )


@lru_cache()
def get_chat_log_adapter() -> SupabaseChatLogAdapter | None:
    """Create and cache the Supabase chat log adapter. Returns None if not configured."""
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key:
        return None
    return SupabaseChatLogAdapter(
        url=settings.supabase_url,
        key=settings.supabase_key,
    )


def get_chat_service() -> ChatService:
    """Compose the ChatService with injected dependencies."""
    return ChatService(
        llm=get_llm_adapter(),
        retriever=get_retriever_adapter(),
        chat_log=get_chat_log_adapter(),
    )
