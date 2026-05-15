"""Todo resource router — all five todo endpoints."""

from fastapi import APIRouter, Request, Response, status

from hello_todo_fastapi.models.todo import (
    CreateTodoRequest,
    PatchTodoRequest,
    TodoListResponse,
    TodoResponse,
)
from hello_todo_fastapi.services.todo import TodoService

router = APIRouter(prefix="/v1/todos")


def _get_service(request: Request) -> TodoService:
    """Extract the TodoService from application state."""
    service: TodoService = request.app.state.service
    return service


@router.post("", status_code=status.HTTP_201_CREATED, response_model=TodoResponse)
async def create_todo(request: Request, body: CreateTodoRequest) -> TodoResponse:
    """Create a new todo item.

    Returns 201 with the created todo on success.
    Returns 422 when title is missing, empty, or exceeds 200 characters.
    """
    service = _get_service(request)
    todo = await service.create(body)
    return TodoResponse.from_todo(todo)


@router.get("", response_model=TodoListResponse)
async def list_todos(request: Request) -> TodoListResponse:
    """Return all todos wrapped in an items envelope."""
    service = _get_service(request)
    todos = await service.list_all()
    return TodoListResponse(items=[TodoResponse.from_todo(t) for t in todos])


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(request: Request, todo_id: str) -> TodoResponse:
    """Return a single todo by id.

    Returns 200 on success.
    Returns 404 when the id is not found.
    """
    service = _get_service(request)
    todo = await service.get(todo_id)
    return TodoResponse.from_todo(todo)


@router.patch("/{todo_id}", response_model=TodoResponse)
async def update_todo(request: Request, todo_id: str, body: PatchTodoRequest) -> TodoResponse:
    """Partially update a todo.

    Only fields present in the request body are modified.
    Returns 200 with the updated todo on success.
    Returns 404 when the id is not found.
    Returns 422 when validation rules are violated.
    """
    service = _get_service(request)
    todo = await service.update(todo_id, body)
    return TodoResponse.from_todo(todo)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(request: Request, todo_id: str) -> Response:
    """Delete a todo by id.

    Returns 204 with no body on success.
    Returns 404 when the id is not found.
    """
    service = _get_service(request)
    await service.delete(todo_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
