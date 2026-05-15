# My Service

A Go Gin service using clean architecture.

## Quickstart

```bash
# 1. Rename the module to match your project
go mod edit -module github.com/your-org/your-service

# 2. Install dependencies
make setup

# 3. Run the server (defaults to :8080, override with PORT env var)
make run

# 4. Run tests
make test

# 5. Lint
make lint

# 6. Format
make fmt
```

## Endpoints

| Method | Path      | Description   |
|--------|-----------|---------------|
| GET    | /healthz  | Health check  |

## Architecture

This skeleton uses **clean architecture**:

- `cmd/api/` — application entrypoint and dependency wiring
- `internal/domain/` — core business rules and domain types
- `internal/application/` — use cases and application orchestration
- `internal/ports/` — inward-facing interfaces owned by the core
- `internal/adapters/http/` — Gin edge layer and request/response translation
- `internal/adapters/repository/` — persistence adapters
- `internal/config/` — configuration loading and validation
- `pkg/` — reusable packages with clear external value

## Development

Use Gin only as a delivery adapter. Do not leak Gin or SQL concerns into `domain/` or `application/`.
