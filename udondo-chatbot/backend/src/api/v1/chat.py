"""
Chat API endpoint — Presentation layer.
Handles HTTP requests and SSE streaming responses.
"""

import json
import logging

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from src.api.dependencies import get_chat_service, get_chat_log_adapter
from src.application.chat_service import ChatService
from src.domain.models.message import ChatRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["chat"])


class EvaluationRequest(BaseModel):
    """Request body for updating message evaluation."""
    message_id: str = Field(..., description="UUID of the message to evaluate")
    evaluation: str = Field(..., description="Evaluation value: 'good' or 'bad'")


@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
) -> StreamingResponse:
    """
    Chat endpoint with Server-Sent Events (SSE) streaming.

    Accepts a ChatRequest and returns a streaming response where each
    token is sent as an SSE data event.
    """

    async def event_generator():
        try:
            async for chunk in chat_service.chat_stream(
                message=request.message,
                history=request.history,
                language=request.language,
                session_id=request.session_id,
                user_message_id=request.user_message_id,
                assistant_message_id=request.assistant_message_id,
            ):
                # SSE format: data: <payload>\n\n
                payload = json.dumps({"content": chunk, "done": False})
                yield f"data: {payload}\n\n"

            # Send completion signal
            payload = json.dumps({"content": "", "done": True})
            yield f"data: {payload}\n\n"

        except Exception as e:
            logger.error(f"Stream error: {e}", exc_info=True)
            error_payload = json.dumps({"error": str(e), "done": True})
            yield f"data: {error_payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.patch("/chat/evaluate")
async def evaluate_message(request: EvaluationRequest):
    """Update the evaluation (good/bad) for an existing chat message."""
    chat_log = get_chat_log_adapter()
    if chat_log is None:
        return {"error": "Chat log adapter not configured"}, 503

    await chat_log.update_evaluation(
        message_id=request.message_id,
        evaluation=request.evaluation,
    )
    return {"status": "ok", "message_id": request.message_id, "evaluation": request.evaluation}


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "udondo-chatbot-api"}
