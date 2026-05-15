"""Todo service — all business logic lives here."""

import secrets
from datetime import UTC, datetime

from hello_todo_fastapi.models.todo import CreateTodoRequest, PatchTodoRequest, Todo
from hello_todo_fastapi.repositories.memory import TodoRepository


class TodoService:
    """Application logic for todo CRUD operations.

    Depends on the :class:`~hello_todo_fastapi.repositories.memory.TodoRepository`
    protocol.  The concrete repository is injected at construction time, keeping
    the service independent of any specific storage backend.
    """

    def __init__(self, repo: TodoRepository) -> None:
        self._repo = repo

    async def create(self, request: CreateTodoRequest) -> Todo:
        """Create and persist a new todo.

        Args:
            request: Validated create request.  Title is already stripped and
                validated by Pydantic before this method is called.

        Returns:
            The newly created :class:`Todo` entity.
        """
        now = datetime.now(UTC)
        todo = Todo(
            id=secrets.token_hex(16),
            title=request.title,
            completed=False,
            due_at=request.due_at,
            created_at=now,
            updated_at=now,
        )
        await self._repo.save(todo)
        return todo

    async def list_all(self) -> list[Todo]:
        """Return all stored todos in insertion order."""
        return await self._repo.find_all()

    async def get(self, todo_id: str) -> Todo:
        """Retrieve a single todo by id.

        Raises:
            TodoNotFoundError: if the id is not found.
        """
        return await self._repo.find_by_id(todo_id)

    async def update(self, todo_id: str, patch: PatchTodoRequest) -> Todo:
        """Apply a partial update to an existing todo.

        Only fields that are present in the patch request are modified.
        ``updated_at`` is always refreshed on a successful update, even when
        the body is empty.

        Raises:
            TodoNotFoundError: if the id is not found.
        """
        todo = await self._repo.find_by_id(todo_id)

        if patch.title is not None:
            todo = todo.model_copy(update={"title": patch.title})

        if patch.due_at_is_set():
            # due_at was explicitly included in the request body.
            # Value may be None (clear) or a datetime (set).
            todo = todo.model_copy(update={"due_at": patch.due_at})

        if patch.completed is not None:
            todo = todo.model_copy(update={"completed": patch.completed})

        todo = todo.model_copy(update={"updated_at": datetime.now(UTC)})
        await self._repo.save(todo)
        return todo

    async def delete(self, todo_id: str) -> None:
        """Delete a todo by id.

        Raises:
            TodoNotFoundError: if the id is not found.
        """
        await self._repo.delete(todo_id)
