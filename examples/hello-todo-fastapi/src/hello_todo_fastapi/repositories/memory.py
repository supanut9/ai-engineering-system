"""In-memory repository adapter implementing the TodoRepository protocol."""

import asyncio
from typing import Protocol, runtime_checkable

from hello_todo_fastapi.errors.api_error import TodoNotFoundError
from hello_todo_fastapi.models.todo import Todo


@runtime_checkable
class TodoRepository(Protocol):
    """Async protocol that all repository adapters must implement.

    The service layer depends only on this protocol, not on any concrete class.
    Swap the in-memory adapter for a database-backed one by implementing this
    protocol and passing the new adapter to :class:`TodoService`.
    """

    async def save(self, todo: Todo) -> None:
        """Persist (create or update) a todo.

        If a todo with the same id already exists it is overwritten.
        """
        ...

    async def find_all(self) -> list[Todo]:
        """Return all stored todos in insertion order."""
        ...

    async def find_by_id(self, todo_id: str) -> Todo:
        """Return the todo with the given id.

        Raises:
            TodoNotFoundError: if no todo with ``todo_id`` exists.
        """
        ...

    async def delete(self, todo_id: str) -> None:
        """Remove the todo with the given id.

        Raises:
            TodoNotFoundError: if no todo with ``todo_id`` exists.
        """
        ...


class MemoryTodoRepository:
    """Thread-safe (asyncio) in-memory implementation of :class:`TodoRepository`.

    Storage is a ``dict[str, Todo]`` plus an insertion-order list, both guarded
    by a single ``asyncio.Lock``.  All public methods are ``async`` so they
    compose correctly with FastAPI's async route handlers.
    """

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._items: dict[str, Todo] = {}
        self._order: list[str] = []

    async def save(self, todo: Todo) -> None:
        """Persist a todo; preserves insertion order on first save."""
        async with self._lock:
            if todo.id not in self._items:
                self._order.append(todo.id)
            # Store a shallow copy so the caller cannot mutate stored state.
            self._items[todo.id] = todo.model_copy()

    async def find_all(self) -> list[Todo]:
        """Return all todos in insertion order as shallow copies."""
        async with self._lock:
            return [self._items[oid].model_copy() for oid in self._order]

    async def find_by_id(self, todo_id: str) -> Todo:
        """Return a shallow copy of the matching todo.

        Raises:
            TodoNotFoundError: if ``todo_id`` is not present.
        """
        async with self._lock:
            if todo_id not in self._items:
                raise TodoNotFoundError(todo_id)
            return self._items[todo_id].model_copy()

    async def delete(self, todo_id: str) -> None:
        """Remove the todo from the store.

        Raises:
            TodoNotFoundError: if ``todo_id`` is not present.
        """
        async with self._lock:
            if todo_id not in self._items:
                raise TodoNotFoundError(todo_id)
            del self._items[todo_id]
            self._order = [oid for oid in self._order if oid != todo_id]
