"""
Port (abstract interface) for document retrieval.
Infrastructure adapters must implement this contract.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class RetrievedDocument:
    """A document retrieved from the knowledge base."""
    content: str
    metadata: dict = field(default_factory=dict)
    score: float = 0.0


class RetrieverPort(ABC):
    """Abstract interface for knowledge retrieval."""

    @abstractmethod
    async def retrieve(self, query: str, top_k: int = 5) -> list[RetrievedDocument]:
        """
        Retrieve the most relevant documents for the given query.

        Args:
            query: The search query string.
            top_k: Maximum number of documents to return.

        Returns:
            List of retrieved documents ordered by relevance.
        """
        ...  # pragma: no cover
