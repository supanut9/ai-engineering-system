# My Service

A NestJS service using layered architecture.

## Quickstart

```bash
# 1. Install dependencies
make setup

# 2. Run in dev mode (hot reload)
make run

# 3. Run tests
make test

# 4. Type-check
make lint

# 5. Format (add prettier in Phase 3 tooling)
make fmt
```

## Endpoints

| Method | Path      | Description   |
|--------|-----------|---------------|
| GET    | /healthz  | Health check  |

## Architecture

This skeleton uses **NestJS layered architecture**:

- `src/modules/health/` — Health feature module (controller, service, module)
- `src/common/` — Shared cross-cutting framework utilities (filters, guards, interceptors, pipes)
- `src/config/` — Environment and app configuration
- `test/` — Integration or e2e test support

## Development

Keep controllers thin. Place business logic in services. Do not let DTOs become the domain model for everything.
