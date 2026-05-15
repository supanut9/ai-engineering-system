# reference examples

Each reference example is a tiny, fully filled-in project that walks all eight workflow phases end-to-end — Phase 0 intake, PRD, specs, architecture, ADR, planning, working code, tests, CI, and runbook. They are the proof-of-correctness for the workflow: a contributor can read any example and see what every artifact looks like when it is actually filled in for a real, if small, service. Nothing in the abstract workflow documentation substitutes for seeing a Phase 3 ADR or a Phase 5 runbook written out against a concrete problem.

## the same product, three stacks

All three examples implement the same single-tenant in-memory todo-list HTTP API: six endpoints (`POST /todos`, `GET /todos`, `GET /todos/:id`, `PATCH /todos/:id`, `DELETE /todos/:id`, and `GET /health`), a single `Todo` entity with `id`, `title`, `done`, and `createdAt` fields, and a shared error envelope (`{"error": {"code": "...", "message": "..."}}`). The differences are entirely in how each stack idiom shapes the implementation — folder layout, dependency injection style, validation approach, and test harness.

## examples

### `hello-todo-go` (Go + Gin + hexagonal)

**Status:** available since v0.0.1.

**Stack:** Go 1.23, Gin v1.10.0, hexagonal architecture, in-memory storage, stdlib `log/slog`.

**Highlights:** clearest separation between core, ports, and adapters of the three examples; uses an interface alias to avoid the import cycle that arises when a hexagonal core and its outbound port both reference the domain entity.

**What this example teaches:** how hexagonal architecture works in Go specifically; how to keep `ports/outbound` adapter-independent; how to test handlers via `httptest`.

**Path:** `examples/hello-todo-go/`

---

### `hello-todo-fastapi` (Python + FastAPI + layered)

**Status:** available since v0.0.1.

**Stack:** Python 3.12+, FastAPI 0.136.x, Pydantic v2, layered architecture, in-memory storage.

**Highlights:** routes depend on injected services; services depend on a repository Protocol; tests use FastAPI's `TestClient`. Pydantic v2 handles request validation and serialisation at the API boundary; the error envelope is produced by a single exception handler.

**What this example teaches:** how layered architecture composes via FastAPI's `Depends`; idiomatic Python async services; strict mypy in a real app.

**Path:** `examples/hello-todo-fastapi/`

---

### `hello-todo-nestjs` (TypeScript + NestJS + modules)

**Status:** available since v0.0.1.

**Stack:** NestJS 11.x, TypeScript 5.8+, class-validator/class-transformer, in-memory storage.

**Highlights:** NestJS modules already encode adapter/domain separation through DI; controllers, services, and repositories communicate via injected tokens. A global exception filter normalises errors to the system envelope. Unit specs use `@nestjs/testing` to wire controllers against in-memory repos.

**What this example teaches:** how NestJS modules and DI shape a layered service; class-validator-driven DTOs; the trade-off between Nest's opinions and architectural minimalism.

**Path:** `examples/hello-todo-nestjs/`

---

## comparing the three

| | Go | FastAPI | NestJS |
|---|---|---|---|
| Architecture name | hexagonal | layered | layered (via modules + DI) |
| Validation lives in | service | Pydantic DTOs at the boundary | class-validator on DTOs |
| Error mapping | handler maps service errors to envelope | global exception handler | global exception filter |
| Test harness | `httptest` | `TestClient` (httpx) | `@nestjs/testing` + supertest |
| Composition root | `cmd/api/main.go` | `main.py:app` factory | `main.ts` + `AppModule` |
| Total code files | ~14 | ~17 | ~22 |

## running an example

The general shape is the same for all three:

```bash
cd examples/<name>
make setup
make test
make run
```

For exact commands, environment variables, and prerequisites per example, see that example's `README.md`.

## adding a new example

A new example must:

- Live under `examples/<name>/`.
- Mirror the existing folder layout: `docs/{requirements,specs,architecture,plan,tests,release,maintenance}/` and `.ai/workflow/`.
- Implement the same product (todo-list API) or document any divergence in `project-brief.md`.
- Pass `make setup && make test && make lint && make build` on a fresh checkout.
- Include `.github/workflows/ci.yml`.

See the [governance](governance.md) page for how to propose a new example via a GitHub issue, and the [cookbook](cookbook.md) for stack-specific walkthroughs including an end-to-end guide for running the existing hello-todo examples.

## future examples

Planned for later releases:

- `hello-todo-nextjs` — full-stack Next.js with Server Actions and App Router; demonstrates a frontend-shaped example.
- `hello-todo-fastify` — minimal Fastify hexagonal counterpart; mirrors the Go example more directly than the FastAPI version does.
- `hello-todo-react-native-expo` — mobile-shaped example with a synced offline-first todo store.

## see also

- [Cookbook recipes](cookbook.md) — stack-specific walkthroughs and an end-to-end guide for running the hello-todo examples
- [Workflow overview](workflow/ai-workflow.md) — what each of the eight phases covers and what artifacts each phase produces
- [Subagent contract](workflow/subagent-contract.md) — how the examples were assembled in parallel across lanes
