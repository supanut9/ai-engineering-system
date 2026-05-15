"""Pydantic models for the Todo entity and its request/response DTOs."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated, Any

from pydantic import BaseModel, Field, field_validator, model_validator

# Sentinel object used to distinguish "field omitted" from "field set to None".
# Used in PatchTodoRequest.due_at so we can tell the difference between:
#   {"due_at": null}  → caller wants to clear the due date
#   {}                → caller did not mention due_at; leave it unchanged
_UNSET: Any = object()


class Todo(BaseModel):
    """Core Todo entity stored in the repository."""

    id: str
    title: str
    completed: bool = False
    due_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"extra": "ignore"}


class CreateTodoRequest(BaseModel):
    """Request body for POST /v1/todos."""

    title: Annotated[str, Field(min_length=1, max_length=200)]
    due_at: datetime | None = None

    model_config = {"extra": "ignore"}

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, v: Any) -> Any:
        """Strip whitespace from title before length validation."""
        if isinstance(v, str):
            return v.strip()
        return v

    @model_validator(mode="after")
    def title_not_empty_after_strip(self) -> CreateTodoRequest:
        """Reject titles that are empty or whitespace-only after stripping."""
        if not self.title:
            raise ValueError("title is required")
        return self


class PatchTodoRequest(BaseModel):
    """Request body for PATCH /v1/todos/{id}.

    All fields are optional.  ``due_at`` uses a sentinel default so we can
    distinguish "omitted" (leave unchanged) from ``null`` (clear the due date).
    """

    title: str | None = None
    # The default is the _UNSET sentinel, not None, so we can tell if the caller
    # explicitly sent {"due_at": null} vs just omitted the field entirely.
    due_at: datetime | None | Any = Field(default=_UNSET)
    completed: bool | None = None

    model_config = {"extra": "ignore"}

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, v: Any) -> Any:
        """Strip whitespace from title when present."""
        if isinstance(v, str):
            return v.strip()
        return v

    @model_validator(mode="after")
    def title_not_empty_after_strip(self) -> PatchTodoRequest:
        """Reject an explicitly supplied empty title."""
        if self.title is not None and not self.title:
            raise ValueError("title must not be empty")
        return self

    def due_at_is_set(self) -> bool:
        """Return True if the caller included ``due_at`` in the request body."""
        return self.due_at is not _UNSET


class TodoResponse(BaseModel):
    """Serialised Todo shape returned in API responses."""

    id: str
    title: str
    completed: bool
    due_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"extra": "ignore"}

    @classmethod
    def from_todo(cls, todo: Todo) -> TodoResponse:
        """Construct a response DTO from a domain entity."""
        return cls(
            id=todo.id,
            title=todo.title,
            completed=todo.completed,
            due_at=todo.due_at,
            created_at=todo.created_at,
            updated_at=todo.updated_at,
        )


class TodoListResponse(BaseModel):
    """Wrapper returned by GET /v1/todos."""

    items: list[TodoResponse]
