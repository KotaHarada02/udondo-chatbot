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


@dataclass
class RetrievalResult:
    """Outcome of a retrieval attempt.

    `ok=False` means the search itself failed (e.g. embedding/network/DB error);
    `ok=True` with an empty `documents` list means the search ran fine but found
    no matches. Callers need this distinction to tell "nothing relevant" apart
    from "couldn't search".
    """
    documents: list[RetrievedDocument] = field(default_factory=list)
    ok: bool = True
    error: str | None = None


class RetrieverPort(ABC):
    """Abstract interface for knowledge retrieval."""

    @abstractmethod
    async def retrieve(self, query: str, top_k: int = 5) -> RetrievalResult:
        """
        Retrieve the most relevant documents for the given query.

        Args:
            query: The search query string.
            top_k: Maximum number of documents to return.

        Returns:
            A RetrievalResult carrying the documents (if any) and whether the
            search itself succeeded.
        """
        ...  # pragma: no cover
