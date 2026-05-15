# My Service

A Next.js application using the App Router.

## Quickstart

```bash
# 1. Install dependencies
make setup

# 2. Run in dev mode
make run

# 3. Run tests (add Playwright/Vitest in Phase 3)
make test

# 4. Lint
make lint

# 5. Format (add prettier in Phase 3 tooling)
make fmt
```

## Endpoints / Routes

| Type   | Path           | Description           |
|--------|----------------|-----------------------|
| Page   | /              | Home page             |
| API    | GET /healthz   | Health check          |

## Architecture

This skeleton uses **Next.js App Router** with a feature-oriented structure:

- `src/app/` — routing, layouts, and entry screens (App Router)
- `src/components/` — shared presentational components
- `src/features/` — feature-owned UI and local behavior
- `src/lib/` — lower-level helpers
- `src/services/` — backend calls and orchestration helpers
- `src/types/` — shared TypeScript types
- `public/` — static assets

## Development

Keep business logic out of page components. Keep server and client responsibilities explicit.
