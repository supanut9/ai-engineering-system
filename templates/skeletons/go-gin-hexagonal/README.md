# My Service

A Go Gin service using hexagonal architecture.

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

This skeleton uses **hexagonal architecture** (ports and adapters):

- `cmd/api/` — application entrypoint and dependency wiring
- `internal/core/` — protected business core
- `internal/ports/inbound/` — contracts for incoming application interactions
- `internal/ports/outbound/` — contracts for external dependencies
- `internal/adapters/inbound/http/` — Gin HTTP inbound adapter
- `internal/adapters/outbound/` — concrete infrastructure adapters (postgres, redis, external-api)
- `internal/config/` — configuration loading and validation
- `pkg/` — reusable packages with clear external value

## Development

Use Gin only as an inbound adapter. Define ports only where they protect real boundaries.
