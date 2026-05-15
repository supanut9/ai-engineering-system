"""Tests for GET /healthz."""

from fastapi.testclient import TestClient


def test_health_returns_200(client: TestClient) -> None:
    """GET /healthz should return HTTP 200."""
    response = client.get("/healthz")
    assert response.status_code == 200


def test_health_returns_ok_body(client: TestClient) -> None:
    """GET /healthz should return {"status": "ok"}."""
    response = client.get("/healthz")
    assert response.json() == {"status": "ok"}
