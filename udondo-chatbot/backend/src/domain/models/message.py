"""
Domain models — pure data structures with no external dependencies.
"""

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A single message in a conversation."""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message text content")


class ChatRequest(BaseModel):
    """Incoming chat request from the client."""
    message: str = Field(..., description="User's current message")
    history: list[ChatMessage] = Field(
        default_factory=list,
        description="Previous conversation messages for context",
    )
    language: str = Field(
        default="ja",
        description="Preferred response language code (e.g. 'ja', 'en')",
    )
    session_id: str | None = Field(
        default=None,
        description="Chat session UUID for log grouping",
    )
    user_message_id: str | None = Field(
        default=None,
        description="UUID of the user's message (from frontend)",
    )
    assistant_message_id: str | None = Field(
        default=None,
        description="UUID of the soon-to-be-generated assistant message (from frontend)",
    )


class ChatChunk(BaseModel):
    """A single streamed chunk of assistant response."""
    content: str
    done: bool = False
