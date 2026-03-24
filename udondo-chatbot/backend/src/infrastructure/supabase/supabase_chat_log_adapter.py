"""
Supabase Chat Log Adapter — implements ChatLogPort using supabase-py.
"""

import logging
from supabase import create_client, Client

from src.domain.interfaces.chat_log_port import ChatLogPort
from src.domain.models.chat_log import ChatLogEntry

logger = logging.getLogger(__name__)


class SupabaseChatLogAdapter(ChatLogPort):
    """Concrete implementation of ChatLogPort using Supabase."""

    TABLE_NAME = "chat_logs"

    def __init__(self, url: str, key: str):
        self._client: Client = create_client(url, key)

    async def save_message(self, entry: ChatLogEntry) -> None:
        """Insert a chat log entry into the chat_logs table."""
        row = entry.model_dump(exclude_none=True)
        try:
            self._client.table(self.TABLE_NAME).insert(row).execute()
            logger.info(f"Chat log saved: role={entry.role}, session={entry.session_id}")
        except Exception as e:
            logger.error(f"Failed to save chat log: {e}", exc_info=True)

    async def update_evaluation(self, message_id: str, evaluation: str) -> None:
        """Update the evaluation field of an existing message."""
        try:
            self._client.table(self.TABLE_NAME).update(
                {"evaluation": evaluation}
            ).eq("id", message_id).execute()
            logger.info(f"Evaluation updated: id={message_id}, evaluation={evaluation}")
        except Exception as e:
            logger.error(f"Failed to update evaluation: {e}", exc_info=True)
