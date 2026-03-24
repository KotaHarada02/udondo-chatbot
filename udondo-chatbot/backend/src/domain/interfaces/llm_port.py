"""
Port (abstract interface) for LLM generation.
Infrastructure adapters must implement this contract.
"""

from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator

from src.domain.models.message import ChatMessage


class LLMPort(ABC):
    """Abstract interface for language model generation."""

    @abstractmethod
    async def generate_stream(
        self,
        query: str,
        context: str,
        history: list[ChatMessage],
        language: str,
    ) -> AsyncGenerator[str, None]:
        """
        Generate a streaming response given query, retrieved context,
        conversation history, and target language.

        Yields text chunks as they are generated.
        """
        ...  # pragma: no cover
