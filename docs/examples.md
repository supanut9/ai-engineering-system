# reference examples

Each reference example is a tiny, fully filled-in project that walks all eight workflow phases end-to-end — Phase 0 intake, PRD, specs, architecture, ADR, planning, working code, tests, CI, and runbook. They are the proof-of-correctness for the workflow: a contributor can read any example and see what every artifact looks like when it is actually filled in for a real, if small, service. Nothing in the abstract workflow documentation substitutes for seeing a Phase 3 ADR or a Phase 5 runbook written out against a concrete problem.

## the same product, six stacks

Five of the six examples implement the same single-tenant in-memory todo-list HTTP API: six endpoints (`POST /todos`, `GET /todos`, `GET /todos/:id`, `PATCH /todos/:id`, `DELETE /todos/:id`, and `GET /health`), a single `Todo` entity with `id`, `title`, `done`, and `createdAt` fields, and a shared error envelope (`{"error": {"code": "...", "message": "..."}}`). The differences are entirely in how each stack idiom shapes the implementation — folder layout, dependency injection style, validation approach, and test harness.

The sixth example — `hello-todo-react-native-expo` — is **deliberately the odd one out**: a mobile app with no backend, no HTTP API, and offline-first persistence via AsyncStorage. It is the system's reference for how a mobile-shaped project diverges from a server-shaped one (no `api-spec.md`; a new `screens.md`; an EAS-based deployment plan).

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

### `hello-todo-nextjs` (TypeScript + Next.js + App Router + layered)

**Status:** available since v0.3.0.

**Stack:** Next.js 16.2.x, React 19.2, TypeScript 6.0+, App Router, in-memory storage, Vitest 4 + @testing-library/react.

**Highlights:** the home page is a Server Component that reads the in-memory repo directly — no HTTP hop on first render. A `"use client"` `TodoList` drives all mutations through `/api/todos` route handlers. The data layer is a `createMemoryRepo()` factory: tests get isolated state, and the running process gets a module-level singleton via `getSingletonRepo()`.

**What this example teaches:** how to compose a Next.js App Router app around a small services/lib layered split; when an RSC reading the repo directly is the right move; how Vitest + @testing-library/react slot into a real Next.js project (avoiding the Jest/Next 16 friction).

**Path:** `examples/hello-todo-nextjs/`

---

### `hello-todo-fastify` (TypeScript + Fastify + hexagonal)

**Status:** available since v0.4.0.

**Stack:** Fastify 5.8.x, TypeScript 6.0+, Zod 4 via `fastify-type-provider-zod`, pino logging, Vitest 4, hexagonal architecture, in-memory storage.

**Highlights:** the closest TypeScript counterpart to `hello-todo-go` — same `/v1/todos` API shape, same `:8080` port, same error envelope. Validation is split between Zod schemas at the HTTP boundary (structural type checks; Fastify rejects malformed requests with 400) and the core service (business rules like `trim`, length bounds). The composition root in `src/index.ts` wires repo → service → server in three lines. Route integration tests use `fastify.inject()` for in-process exercise (no socket).

**What this example teaches:** how Fastify's typed plugin architecture composes a hexagonal core; how Zod doubles as both request validation and response serialisation; the trade-off between Fastify's lightweight DX and a heavier framework like NestJS.

**Path:** `examples/hello-todo-fastify/`

---

### `hello-todo-rust` (Rust + Axum + hexagonal)

**Status:** available since v0.6.0.

**Stack:** Rust edition 2024 (MSRV 1.85), Axum 0.8, Tokio 1.45, tower-http 0.6, hexagonal architecture, in-memory storage via `tokio::sync::RwLock`, structured logging via `tracing`.

**Highlights:** the strongest type-system enforcement of the hexagonal boundary of any example. The `TodoRepository` outbound port is an `async_trait` returning a concrete domain `Error` enum, so handler-side error mapping is exhaustive at compile time. PATCH `due_at` three-state (absent / null / value) is parsed via `serde_json::Map<String, Value>` mirroring the Go example's pattern; `Uuid::new_v4().simple()` replaces `crypto/rand` for ids.

**What this example teaches:** how hexagonal architecture works in Rust specifically; when a port trait + `Arc<dyn Trait>` boundary pays for itself; how to wire graceful shutdown with `tokio::signal::ctrl_c` + `axum::serve`; how `cargo clippy -D warnings` + `cargo fmt --check` substitute for `gofmt` + `go vet`.

**Path:** `examples/hello-todo-rust/`

---

### `hello-todo-react-native-expo` (TypeScript + Expo + AsyncStorage)

**Status:** available since v0.5.0.

**Stack:** Expo SDK 55, Expo Router, React Native 0.85, React 19.2, TypeScript 6.0+, AsyncStorage for offline persistence, Jest with `jest-expo` preset + `@testing-library/react-native`.

**Highlights:** the system's reference for a **mobile-shaped** project — no backend, no HTTP, no port. Two screens (list + add modal) wire through a single `useTodos` hook that hydrates from AsyncStorage on mount and writes back on every mutation. The data layer is a thin in-memory `Map` + serialise-to-AsyncStorage rather than a redux/zustand store, keeping dependencies minimal. Uses `Pressable` rather than `TouchableOpacity` to side-step a renderer version-mismatch issue under jest-expo 55.

**What this example teaches:** how Expo Router (file-system routing) shapes a mobile app the same way Next.js App Router shapes a web one; how load-on-mount + save-on-mutate persistence behaves for a small offline-first app; how the "Phase 7 deployment plan" looks when the production target is App Store Connect / Play Console / EAS Update OTAs instead of a Kubernetes cluster.

**Path:** `examples/hello-todo-react-native-expo/`

---

## comparing the six backend stacks

| | Go | FastAPI | NestJS | Next.js | Fastify | Rust |
|---|---|---|---|---|---|---|
| Architecture name | hexagonal | layered | layered (modules + DI) | layered (App Router + services) | hexagonal | hexagonal |
| Validation lives in | service | Pydantic DTOs at the boundary | class-validator on DTOs | hand-rolled validators in `types/` | Zod schemas at the boundary + service rules | service + `serde` deserialisation rejection at boundary |
| Error mapping | handler maps service errors to envelope | global exception handler | global exception filter | route handler maps service errors | `setErrorHandler` on Fastify instance | `AppError` impl `IntoResponse` + exhaustive `match` |
| Test harness | `httptest` | `TestClient` (httpx) | `@nestjs/testing` + supertest | Vitest + @testing-library/react | Vitest + `fastify.inject()` | `tower::ServiceExt::oneshot` + `cargo test` |
| Composition root | `cmd/api/main.go` | `main.py:app` factory | `main.ts` + `AppModule` | App Router (`src/app/`) — implicit | `src/index.ts` (3 lines) | `src/main.rs` + `axum::serve` |
| Total code files | ~14 | ~17 | ~22 | ~19 | ~16 | ~17 |

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

The current six examples cover the system's core stacks. Future additions will be driven by community demand. Candidates worth considering:

- A `hello-todo-rust-axum` Rust counterpart (hexagonal, mirrors `hello-todo-go`).
- A `hello-todo-elixir-phoenix` example to demonstrate a non-OO language stack.
- A "todo + Postgres" variant of one of the existing stacks to demonstrate the persistence-adapter shape.

## see also

- [Cookbook recipes](cookbook.md) — stack-specific walkthroughs and an end-to-end guide for running the hello-todo examples
- [Workflow overview](workflow/ai-workflow.md) — what each of the eight phases covers and what artifacts each phase produces
- [Subagent contract](workflow/subagent-contract.md) — how the examples were assembled in parallel across lanes
