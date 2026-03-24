"""
Port (abstract interface) for chat log persistence.
Infrastructure adapters must implement this contract.
"""

from abc import ABC, abstractmethod

from src.domain.models.chat_log import ChatLogEntry


class ChatLogPort(ABC):
    """Abstract interface for saving chat logs."""

    @abstractmethod
    async def save_message(self, entry: ChatLogEntry) -> None:
        """
        Persist a single chat log entry.

        Args:
            entry: The chat log entry to save.
        """
        ...  # pragma: no cover

    @abstractmethod
    async def update_evaluation(self, message_id: str, evaluation: str) -> None:
        """
        Update the evaluation field for an existing message.

        Args:
            message_id: UUID of the message to update.
            evaluation: Evaluation value ('good', 'bad', etc.).
        """
        ...  # pragma: no cover
