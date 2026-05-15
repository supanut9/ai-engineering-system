"""Tests for the health check endpoint."""

from fastapi.testclient import TestClient

from my_service.main import app

client = TestClient(app)


def test_health_returns_200() -> None:
    """GET /healthz should return HTTP 200."""
    response = client.get("/healthz")
    assert response.status_code == 200


def test_health_returns_ok_body() -> None:
    """GET /healthz should return {"status": "ok"}."""
    response = client.get("/healthz")
    assert response.json() == {"status": "ok"}
