"""
Lightweight abuse controls for public endpoints: optional API key check and
an in-memory per-IP rate limit.

Scoped for a single-process, personal-scale deployment — state is kept in a
process-local dict, so it does not coordinate across multiple worker processes
or instances. That's an acceptable trade-off here; a distributed store (e.g.
Redis) would be the upgrade path if the backend is ever scaled horizontally.
"""

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from src.core.config import get_settings

_request_log: dict[str, deque[float]] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    """Best-effort client IP, accounting for a reverse proxy in front of uvicorn."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def enforce_rate_limit(request: Request) -> None:
    """Reject requests once an IP exceeds settings.rate_limit_requests per window."""
    settings = get_settings()
    window = settings.rate_limit_window_seconds
    bucket = _request_log[_client_ip(request)]
    now = time.monotonic()

    while bucket and now - bucket[0] > window:
        bucket.popleft()

    if len(bucket) >= settings.rate_limit_requests:
        retry_after = int(window - (now - bucket[0])) + 1
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(retry_after)},
        )

    bucket.append(now)


async def verify_api_key(request: Request) -> None:
    """Check the X-API-Key header against settings.api_key.

    Disabled entirely when settings.api_key is unset, so local development
    and deployments that intentionally serve a public frontend without a key
    keep working unchanged.
    """
    settings = get_settings()
    if not settings.api_key:
        return

    if request.headers.get("x-api-key") != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
