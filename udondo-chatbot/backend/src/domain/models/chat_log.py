"""
Domain model for chat log entries — maps to the Supabase chat_logs table.
"""

from typing import Any
from pydantic import BaseModel, Field


class ChatLogEntry(BaseModel):
    """A single row in the chat_logs table."""

    id: str | None = Field(default=None, description="Message UUID (auto-generated if None)")
    session_id: str | None = Field(default=None, description="Chat session UUID")
    user_id: str | None = Field(default=None, description="User UUID (nullable)")
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")
    model_used: str | None = Field(default=None, description="LLM model name for assistant messages")
    evaluation: str | None = Field(default=None, description="'good', 'bad', or NULL")
    tokens: int | None = Field(default=None, description="Token count for this message")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Extra data (processing time, sources, etc.)")
