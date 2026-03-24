"""
Chat Service — Application layer orchestrator for RAG pipeline.
Depends only on abstract ports, never on concrete infrastructure.
"""

import time
import logging
from collections.abc import AsyncGenerator

from src.domain.interfaces.llm_port import LLMPort
from src.domain.interfaces.retriever_port import RetrieverPort, RetrievedDocument
from src.domain.interfaces.chat_log_port import ChatLogPort
from src.domain.models.message import ChatMessage
from src.domain.models.chat_log import ChatLogEntry
from src.core.config import get_settings

logger = logging.getLogger(__name__)


class ChatService:
    """Orchestrates the RAG pipeline: retrieve → augment → generate → log."""

    def __init__(self, llm: LLMPort, retriever: RetrieverPort, chat_log: ChatLogPort | None = None):
        self._llm = llm
        self._retriever = retriever
        self._chat_log = chat_log

    async def chat_stream(
        self,
        message: str,
        history: list[ChatMessage],
        language: str = "ja",
        session_id: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """
        Process a chat message through the RAG pipeline and stream the response.

        1. Retrieve relevant documents from the knowledge base
        2. Format retrieved context
        3. Stream LLM response with augmented context
        4. Save user + assistant messages to chat log
        """
        start_time = time.time()

        # Step 1: Retrieve relevant documents
        documents = await self._retriever.retrieve(query=message, top_k=5)

        # Step 2: Format context from retrieved documents
        context = self._format_context(documents)

        # Step 3: Stream generation with context, accumulate full response
        full_response = ""
        async for chunk in self._llm.generate_stream(
            query=message,
            context=context,
            history=history,
            language=language,
        ):
            full_response += chunk
            yield chunk

        # Step 4: Save chat logs (fire-and-forget, non-blocking)
        elapsed = time.time() - start_time
        settings = get_settings()

        if self._chat_log:
            try:
                # Save user message
                user_entry = ChatLogEntry(
                    session_id=session_id,
                    role="user",
                    content=message,
                    metadata={"language": language},
                )
                await self._chat_log.save_message(user_entry)

                # Save assistant message
                assistant_entry = ChatLogEntry(
                    session_id=session_id,
                    role="assistant",
                    content=full_response,
                    model_used=settings.llm_model,
                    tokens=len(full_response),
                    metadata={
                        "language": language,
                        "processing_time_sec": round(elapsed, 2),
                        "retrieved_docs": len(documents),
                    },
                )
                await self._chat_log.save_message(assistant_entry)
            except Exception as e:
                logger.error(f"Failed to save chat logs: {e}", exc_info=True)

    @staticmethod
    def _format_context(documents: list[RetrievedDocument]) -> str:
        """Format retrieved documents into a context string for the LLM."""
        if not documents:
            return ""

        context_parts = []
        for i, doc in enumerate(documents, 1):
            # Include metadata if available
            meta_str = ""
            if doc.metadata:
                meta_items = [f"{k}: {v}" for k, v in doc.metadata.items()]
                meta_str = f"\n  属性: {', '.join(meta_items)}"

            context_parts.append(
                f"[ドキュメント {i}]\n{doc.content}{meta_str}"
            )

        return "\n\n---\n\n".join(context_parts)
