# system design — hello-todo-nextjs

References: `../requirements/prd.md` (success criteria), `../specs/functional-spec.md`
(behavioral contract), `decisions/0001-nextjs-app-router-layered.md` (architectural choice).

---

## context

`hello-todo-nextjs` is a single-process Node.js application built with Next.js (App
Router) that stores todo items in memory. Its primary purpose is to be a readable,
self-contained reference example; simplicity is a first-class constraint alongside
correctness. There are no external dependencies at runtime (no database, no cache, no
message queue).

---

## layered architecture overview

```
                     ┌──────────────────────────────────┐
                     │        HTTP (Next.js runtime)     │
                     │    App Router + Node.js server    │
                     └────────┬──────────────────────────┘
                              │
              ┌───────────────┼───────────────────┐
              │               │                   │
   ┌──────────▼──────────┐    │       ┌───────────▼──────────┐
   │   Route Handlers    │    │       │   Server Components   │
   │ app/api/todos/      │    │       │   app/page.tsx        │
   │   route.ts          │    │       │   (home page)         │
   │ app/api/todos/[id]/ │    │       └───────────┬──────────┘
   │   route.ts          │    │                   │
   │ app/healthz/        │    │                   │
   │   route.ts          │    │                   │
   └──────────┬──────────┘    │                   │
              │               │                   │
              └───────────────┼───────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │      Services       │
                   │  src/services/      │
                   │    todos.ts         │
                   └──────────┬──────────┘
                              │
                   ┌──────────▼──────────┐
                   │    Lib / Repo       │
                   │  src/lib/repo.ts    │
                   │  (Map<string, Todo>)│
                   └─────────────────────┘
```

---

## components

### app/layout.tsx — root layout

Wraps the entire application with an HTML shell. Declares metadata and global styles.
No data fetching.

### app/page.tsx — home server component

Calls `todosService.findAll()` directly (no HTTP round-trip) and renders the todo list
as HTML. Displays a "No todos yet" placeholder when the store is empty. All rendering
is server-side; no React client state.

### app/healthz/route.ts — health route handler

Handles `GET /healthz`. Returns `{"status":"ok"}` immediately. No dependency on the
service or repo.

### app/api/todos/route.ts — collection route handler

Handles `GET /api/todos` and `POST /api/todos`. Thin: reads the request body, delegates
to the todos service, encodes the response. No business logic. Parses JSON manually
via `request.json()` and catches parse errors to return 400.

### app/api/todos/[id]/route.ts — item route handler

Handles `GET /api/todos/[id]`, `PATCH /api/todos/[id]`, and `DELETE /api/todos/[id]`.
Reads `params.id` from the Next.js route context and delegates to the service.

### src/services/todos.ts — service (business logic)

Pure functions (no class required; no DI container). Business logic: title trim and
whitespace validation, PATCH null-vs-absent semantics, error propagation by throwing
plain `Error` objects with a `code` property (`not_found`, `validation_error`).
Imports `repo` directly; there is no interface indirection for v0.1.0.

### src/lib/repo.ts — in-memory repository

Module-level singleton: a `Map<string, Todo>` plus an insertion-order `string[]`.
Exports pure functions: `create`, `findAll`, `findById`, `update`, `remove`, and
`generateId`. All read operations return copies (spread) to prevent callers from
mutating internal state.

### src/types/todo.ts — shared types

Exports the `Todo` TypeScript interface. No runtime code; types only.

---

## data flow

```
Request → Next.js App Router → Route Handler (parse + validate shape)
       → Service (business logic, validation, error throwing)
       → Repo (Map read/write)
       → return value → Route Handler → NextResponse JSON
```

Error flow: repo returns `undefined` for missing resources; service throws an `Error`
with `code: 'not_found'` or `code: 'validation_error'`; route handler catches and maps
to the uniform error envelope via a shared `errorResponse` helper. Malformed JSON in
the request body is caught by the `request.json()` try/catch in the route handler.

The home page server component (`app/page.tsx`) calls the service directly and renders
results to HTML without passing through any HTTP layer.

---

## key tradeoffs

| tradeoff | choice | rationale |
|---|---|---|
| simplicity vs persistence | in-memory only | keeps the example readable; persistence is out of scope for v0.1.0 |
| App Router vs Pages Router | App Router | current Next.js default; server components remove client/server fetch duplication; see ADR-0001 |
| service as pure functions vs class | pure functions | no DI container in Next.js; plain imports are simpler and equally testable |
| manual validation vs library | manual (trim + length + Date.parse) | avoids a runtime dependency for a handful of rules; keeps the example self-explanatory |
| string timestamps vs Date objects | ISO8601 strings | avoids serialization inconsistency; strings are explicit and round-trip through JSON cleanly |
| external id library vs crypto | crypto (stdlib) | no extra dependency; 32-char hex is sufficient for an in-memory example |

---

## deployment shape

Single Node.js process. Build and start with:
```bash
next build
PORT=3000 next start
```

No containerization required for local development. The process is self-contained; there
is no database to migrate, no secret manager to connect to, no sidecar required.

---

## observability

- **logging:** `console.error` / `console.log` to stdout; Next.js internal request logs
  to stdout.
- **health check:** `GET /healthz` returns `{"status":"ok"}` while the process is alive.
- **metrics:** out of scope for v0.1.0.
- **tracing:** out of scope for v0.1.0.
