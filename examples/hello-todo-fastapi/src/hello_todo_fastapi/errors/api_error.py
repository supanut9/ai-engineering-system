"""Typed exceptions and uniform error envelope model."""

from pydantic import BaseModel


class TodoNotFoundError(Exception):
    """Raised when a todo id is not present in the repository."""


class ErrorDetail(BaseModel):
    """Inner object of the uniform error response."""

    code: str
    message: str


class ErrorEnvelope(BaseModel):
    """Uniform JSON error response shape for all non-2xx responses.

    Example::

        {"error": {"code": "not_found", "message": "todo not found"}}
    """

    error: ErrorDetail
