"""Shared test fixtures."""

import pytest
from fastapi.testclient import TestClient

from hello_todo_fastapi.main import create_app


@pytest.fixture
def client() -> TestClient:
    """Return a fresh TestClient backed by a new app instance (empty store)."""
    return TestClient(create_app())
