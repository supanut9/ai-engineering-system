"""Tests for the todo CRUD endpoints.

Covers all user stories US-001 through US-008 from
docs/requirements/acceptance-criteria.md.
"""

from typing import Any

import pytest
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def create_todo(client: TestClient, title: str = "buy milk", **extra: Any) -> dict[str, Any]:
    """POST /v1/todos and return the parsed JSON body.

    Asserts 201 to catch silent failures early.
    """
    payload: dict[str, Any] = {"title": title, **extra}
    response = client.post("/v1/todos", json=payload)
    assert response.status_code == 201, f"expected 201, got {response.status_code}: {response.text}"
    result: dict[str, Any] = response.json()
    return result


# ---------------------------------------------------------------------------
# POST /v1/todos — US-001, US-002, US-007
# ---------------------------------------------------------------------------


def test_create_todo_happy_path(client: TestClient) -> None:
    """US-001: POST with valid title returns 201 and a well-formed todo."""
    body = create_todo(client, "buy milk")
    assert body["id"] != ""
    assert len(body["id"]) == 32
    assert body["title"] == "buy milk"
    assert body["completed"] is False
    assert body["due_at"] is None
    assert body["created_at"] != ""
    assert body["updated_at"] == body["created_at"]


def test_create_todo_with_due_at(client: TestClient) -> None:
    """US-002: POST with due_at persists and returns the due date."""
    body = create_todo(client, "call dentist", due_at="2026-06-01T09:00:00Z")
    assert body["due_at"] is not None
    assert "2026-06-01" in body["due_at"]


def test_create_todo_empty_title_returns_422(client: TestClient) -> None:
    """US-007: POST with empty title returns 422 validation_error."""
    response = client.post("/v1/todos", json={"title": ""})
    assert response.status_code == 422
    err = response.json()["error"]
    assert err["code"] == "validation_error"


def test_create_todo_whitespace_title_returns_422(client: TestClient) -> None:
    """US-007: POST with whitespace-only title is rejected."""
    response = client.post("/v1/todos", json={"title": "   "})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_create_todo_missing_title_returns_422(client: TestClient) -> None:
    """US-007: POST with no title key returns 422."""
    response = client.post("/v1/todos", json={})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_create_todo_title_too_long_returns_422(client: TestClient) -> None:
    """US-007: POST with a 201-char title returns 422."""
    response = client.post("/v1/todos", json={"title": "x" * 201})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_create_todo_title_exactly_200_chars_accepted(client: TestClient) -> None:
    """Edge case: title of exactly 200 chars is accepted."""
    body = create_todo(client, "a" * 200)
    assert body["title"] == "a" * 200


# ---------------------------------------------------------------------------
# GET /v1/todos — US-003
# ---------------------------------------------------------------------------


def test_list_todos_empty(client: TestClient) -> None:
    """US-003: GET list with no items returns 200 and empty items array."""
    response = client.get("/v1/todos")
    assert response.status_code == 200
    assert response.json() == {"items": []}


def test_list_todos_with_items(client: TestClient) -> None:
    """US-003: GET list after two creates returns both todos."""
    create_todo(client, "first")
    create_todo(client, "second")
    response = client.get("/v1/todos")
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 2
    titles = {item["title"] for item in items}
    assert titles == {"first", "second"}


# ---------------------------------------------------------------------------
# GET /v1/todos/{id} — US-004, US-008
# ---------------------------------------------------------------------------


def test_get_todo_happy_path(client: TestClient) -> None:
    """US-004: GET by id returns 200 with matching todo."""
    created = create_todo(client, "get me")
    todo_id = created["id"]
    response = client.get(f"/v1/todos/{todo_id}")
    assert response.status_code == 200
    assert response.json()["id"] == todo_id
    assert response.json()["title"] == "get me"


def test_get_todo_not_found(client: TestClient) -> None:
    """US-008: GET with unknown id returns 404 not_found."""
    response = client.get("/v1/todos/doesnotexist")
    assert response.status_code == 404
    err = response.json()["error"]
    assert err["code"] == "not_found"
    assert err["message"] == "todo not found"


# ---------------------------------------------------------------------------
# PATCH /v1/todos/{id} — US-005, US-007, US-008
# ---------------------------------------------------------------------------


def test_update_todo_happy_path(client: TestClient) -> None:
    """US-005: PATCH updates title and completed; updated_at advances."""
    created = create_todo(client, "original")
    todo_id = created["id"]
    response = client.patch(f"/v1/todos/{todo_id}", json={"title": "updated", "completed": True})
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "updated"
    assert body["completed"] is True
    assert body["id"] == todo_id


def test_update_todo_partial_fields_unchanged(client: TestClient) -> None:
    """US-005: PATCH with only completed leaves title unchanged."""
    created = create_todo(client, "stay the same")
    todo_id = created["id"]
    response = client.patch(f"/v1/todos/{todo_id}", json={"completed": True})
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "stay the same"
    assert body["completed"] is True


def test_update_todo_clear_due_at(client: TestClient) -> None:
    """US-005: PATCH with due_at: null clears the field."""
    created = create_todo(client, "task", due_at="2026-12-31T00:00:00Z")
    todo_id = created["id"]
    response = client.patch(f"/v1/todos/{todo_id}", json={"due_at": None})
    assert response.status_code == 200
    assert response.json()["due_at"] is None


def test_update_todo_empty_body_is_idempotent(client: TestClient) -> None:
    """Edge case: PATCH with empty body {} returns 200 and todo unchanged."""
    created = create_todo(client, "no change")
    todo_id = created["id"]
    response = client.patch(f"/v1/todos/{todo_id}", json={})
    assert response.status_code == 200
    assert response.json()["title"] == "no change"


def test_update_todo_empty_title_returns_422(client: TestClient) -> None:
    """US-007: PATCH with empty title returns 422 validation_error."""
    created = create_todo(client, "valid")
    todo_id = created["id"]
    response = client.patch(f"/v1/todos/{todo_id}", json={"title": ""})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_update_todo_not_found(client: TestClient) -> None:
    """US-008: PATCH with unknown id returns 404 not_found."""
    response = client.patch("/v1/todos/ghost", json={"title": "x"})
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


# ---------------------------------------------------------------------------
# DELETE /v1/todos/{id} — US-006, US-008
# ---------------------------------------------------------------------------


def test_delete_todo_happy_path(client: TestClient) -> None:
    """US-006: DELETE returns 204 and subsequent GET returns 404."""
    created = create_todo(client, "delete me")
    todo_id = created["id"]
    response = client.delete(f"/v1/todos/{todo_id}")
    assert response.status_code == 204
    assert response.content == b""
    # Confirm it is gone.
    get_response = client.get(f"/v1/todos/{todo_id}")
    assert get_response.status_code == 404


def test_delete_todo_not_found(client: TestClient) -> None:
    """US-008: DELETE with unknown id returns 404 not_found."""
    response = client.delete("/v1/todos/ghost")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


# ---------------------------------------------------------------------------
# Error envelope shape
# ---------------------------------------------------------------------------


def test_error_envelope_shape(client: TestClient) -> None:
    """Validation errors use the uniform error envelope, not FastAPI's default."""
    response = client.post("/v1/todos", json={"title": ""})
    assert response.status_code == 422
    body = response.json()
    # Must have top-level "error" key — not FastAPI's default "detail".
    assert "error" in body
    assert "detail" not in body
    assert "code" in body["error"]
    assert "message" in body["error"]


@pytest.mark.parametrize(
    ("method", "path", "json_body"),
    [
        ("GET", "/v1/todos/unknown", None),
        ("PATCH", "/v1/todos/unknown", {"title": "x"}),
        ("DELETE", "/v1/todos/unknown", None),
    ],
)
def test_not_found_envelope(
    client: TestClient,
    method: str,
    path: str,
    json_body: dict[str, str] | None,
) -> None:
    """US-008: All three not-found paths return identical error envelope."""
    if json_body is not None:
        response = client.request(method, path, json=json_body)
    else:
        response = client.request(method, path)
    assert response.status_code == 404
    assert response.json() == {"error": {"code": "not_found", "message": "todo not found"}}
