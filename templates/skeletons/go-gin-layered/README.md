# My Service

A Go Gin service using layered architecture.

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

This skeleton uses **layered architecture**:

- `cmd/api/` — application entrypoint and startup wiring
- `internal/http/` — Gin routing, handlers, request and response mapping
- `internal/service/` — application and business flow logic
- `internal/repository/` — persistence access
- `internal/model/` — service-facing data structures and domain types
- `internal/config/` — configuration loading and validation
- `pkg/` — reusable packages with clear external value
- `tests/` — integration or end-to-end test support

## Development

Keep Gin at the HTTP edge only. Keep handlers thin. Place business logic in `service/`.
