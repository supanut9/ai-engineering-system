# My Service

A Fastify TypeScript service using hexagonal architecture.

## Quickstart

```bash
# 1. Rename the package in package.json to match your project

# 2. Install dependencies
make setup

# 3. Run the server (defaults to :4000, override with PORT env var)
make run

# 4. Run tests
make test

# 5. Type-check
make lint

# 6. Format (Phase 3 tooling adds prettier)
make fmt
```

## Endpoints

| Method | Path      | Description  |
|--------|-----------|--------------|
| GET    | /healthz  | Health check |

## Architecture

This skeleton uses hexagonal architecture (ports and adapters):

- `src/server.ts` — composition root; registers plugins and wires dependencies
- `src/core/` — protected business logic; no framework or DB imports
- `src/ports/inbound/` — TypeScript interfaces for incoming application interactions
- `src/ports/outbound/` — TypeScript interfaces for external dependencies
- `src/adapters/inbound/http/routes/` — Fastify route definitions; thin adapters only
- `src/adapters/outbound/` — concrete infrastructure adapters (Prisma, external APIs)
- `src/config/` — configuration loading, validation, and export

## Development

Use Fastify only as an inbound adapter. Never import Fastify types into core services.
Define ports only where they protect real boundaries.

Export `buildServer()` from `src/server.ts` and use `server.inject()` in tests
to avoid binding a real port.
