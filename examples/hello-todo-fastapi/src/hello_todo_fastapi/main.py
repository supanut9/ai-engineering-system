"""FastAPI application factory.

Creates the app, wires dependencies, registers routers, and installs global
exception handlers that map internal errors to the uniform error envelope.
"""

import logging
import logging.config

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from hello_todo_fastapi.api.health import router as health_router
from hello_todo_fastapi.api.todos import router as todos_router
from hello_todo_fastapi.config.settings import settings
from hello_todo_fastapi.errors.api_error import ErrorDetail, ErrorEnvelope, TodoNotFoundError
from hello_todo_fastapi.repositories.memory import MemoryTodoRepository
from hello_todo_fastapi.services.todo import TodoService

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=settings.log_level.upper(),
    format='{"level":"%(levelname)s","message":"%(message)s","logger":"%(name)s"}',
    handlers=[logging.StreamHandler()],
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title="hello-todo-fastapi",
        version="0.1.0",
        description="In-memory todo-list HTTP API — FastAPI reference example.",
    )

    # Wire dependencies onto application state so route handlers can access them.
    repo = MemoryTodoRepository()
    application.state.service = TodoService(repo)

    # Routers
    application.include_router(health_router)
    application.include_router(todos_router)

    # ------------------------------------------------------------------
    # Global exception handlers
    # ------------------------------------------------------------------

    @application.exception_handler(RequestValidationError)
    async def validation_error_handler(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Map Pydantic RequestValidationError to the uniform error envelope."""
        # Collect the first human-readable message from Pydantic's error list.
        first_error = exc.errors()[0] if exc.errors() else {}
        raw_msg = str(first_error.get("msg", "validation error"))
        # Pydantic v2 prefixes messages with "Value error, "; strip that prefix.
        message = raw_msg.removeprefix("Value error, ")
        envelope = ErrorEnvelope(error=ErrorDetail(code="validation_error", message=message))
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=envelope.model_dump(),
        )

    @application.exception_handler(TodoNotFoundError)
    async def not_found_handler(_request: Request, _exc: TodoNotFoundError) -> JSONResponse:
        """Map TodoNotFoundError to a 404 uniform error envelope."""
        envelope = ErrorEnvelope(error=ErrorDetail(code="not_found", message="todo not found"))
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=envelope.model_dump(),
        )

    @application.exception_handler(Exception)
    async def internal_error_handler(_request: Request, exc: Exception) -> JSONResponse:
        """Catch-all for unhandled exceptions; returns 500."""
        logger.exception("unhandled error: %s", exc)
        envelope = ErrorEnvelope(
            error=ErrorDetail(code="internal", message="internal server error")
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=envelope.model_dump(),
        )

    logger.info("server starting on port %d", settings.port)
    return application


app = create_app()
