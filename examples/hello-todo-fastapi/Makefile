.PHONY: setup run test lint fmt typecheck

PY ?= $(shell command -v python3 || command -v python)

setup:
	@if command -v uv >/dev/null 2>&1; then \
		uv venv && uv pip install -e .[dev]; \
	else \
		$(PY) -m venv .venv && .venv/bin/pip install -e .[dev]; \
	fi

# Subsequent targets run inside the venv so they don't depend on the user's PATH.
VENV_BIN := $(if $(wildcard .venv/bin),.venv/bin/,)

run:
	$(VENV_BIN)uvicorn hello_todo_fastapi.main:app --host 0.0.0.0 --port $${PORT:-8000} --reload

test:
	$(VENV_BIN)pytest

lint:
	$(VENV_BIN)ruff check src tests && $(VENV_BIN)ruff format --check src tests

fmt:
	$(VENV_BIN)ruff format src tests

typecheck:
	$(VENV_BIN)mypy src tests
