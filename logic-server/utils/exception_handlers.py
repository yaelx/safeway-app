import uuid
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from utils.logger import logger


class RequestIdMiddleware(BaseHTTPMiddleware):
    """
    Extracts X-Request-Id from request headers (set by the Node orchestrator)
    or generates a new UUID, then stores it on request.state.request_id so
    every downstream handler and the exception handler can reference it.
    """
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        # Echo the id back so the caller can correlate logs
        response.headers["X-Request-Id"] = request_id
        return response


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global catch-all for any unhandled exception that escapes a route handler.

    Security contract:
      - The raw exception message and stack trace are NEVER sent to the client.
      - Full details (including stack trace via exc_info=True) are written to
        the structlog JSON log so Cloud Run / GCP Logging can surface them.
    """
    request_id = getattr(request.state, "request_id", "unknown")

    logger.error(
        "unhandled_exception",
        requestId=request_id,
        path=request.url.path,
        method=request.method,
        exc_info=True,
    )

    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "requestId": request_id},
    )
