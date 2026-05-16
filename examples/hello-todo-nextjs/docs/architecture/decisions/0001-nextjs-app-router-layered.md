# ADR 0001: use Next.js App Router + layered architecture

## status

Accepted
Date: 2026-05-16

## context

Problem:
- The ai-engineering-system needs a Next.js reference example that demonstrates the
  8-phase workflow for a real full-stack application and serves as a counterpart to
  `hello-todo-nestjs` and `hello-todo-go`.
- The example must be small enough to read in full, but architecturally clear enough to
  teach meaningful Next.js App Router patterns: route handlers for the API surface and
  server components for the UI.

Constraints:
- The service must run as a single Node.js process with no external runtime dependencies.
- It must exercise the layered architecture pattern documented in
  `code-architectures/layered-architecture.md` — adapted to the Next.js idiom where
  there is no DI container.
- Implementation must complete in one focused developer-day.

Forces at play:
- Simplicity: fewer moving parts means the architecture is easier to see.
- Teaching value: the example should show Next.js App Router's route handlers and server
  components working together in a practical layered structure, using plain module
  imports rather than a DI container.
- Idiomatic Next.js: route handlers as the HTTP adapter layer, services as the business
  logic layer, and a module-singleton repo as the data layer is the natural App Router
  pattern. Forcing a DI container into Next.js would be unidiomatic and add noise.
- Dependency minimalism: no ORM, no external DB, no message queue reduces noise.

## decision

Use Next.js 15 with TypeScript 5.x, organized as a layered architecture with the
following layers:

1. **route handlers** (HTTP adapter layer): files at `app/api/todos/route.ts` and
   `app/api/todos/[id]/route.ts`. Parse requests, delegate to services, encode
   responses. No business logic. A shared `errorResponse` helper formats the uniform
   error envelope.
2. **server components** (UI adapter layer): `app/page.tsx` calls the service directly
   to render the todo list as HTML server-side. No client fetch, no `useEffect`.
3. **services** (business logic layer): `src/services/todos.ts` — pure exported
   functions. Title trim and whitespace validation, PATCH null-vs-absent semantics,
   typed error throwing. Imported directly by route handlers and server components.
4. **lib / repo** (persistence layer): `src/lib/repo.ts` — module-level singleton
   `Map<string, Todo>` with an insertion-order array. Exported pure functions: `create`,
   `findAll`, `findById`, `update`, `remove`. Returns copies on read to prevent state
   mutation by callers.

Validation is performed manually in the service layer — a small set of guard functions
for the rules in `docs/specs/functional-spec.md`. No external validation library is
introduced.

See `../system-design.md` for the full component breakdown and ASCII diagram.

## consequences

Positive:
- the route-handler → service → repo split maps directly onto the layered architecture
  reference in `code-architectures/layered-architecture.md` without forcing an
  unidiomatic DI container into a Next.js project
- server components let the home page call the service without an HTTP round-trip,
  demonstrating the colocation benefit of App Router
- pure functions are trivially testable in Vitest: no module mocking framework needed
  beyond resetting the in-memory Map in `beforeEach`
- swapping the in-memory repo for a persistent adapter (v0.2.0) requires only changing
  `src/lib/repo.ts` — the service and route handlers are unaffected

Negative:
- the module-level singleton repo means tests that run in the same process share state
  unless they reset it explicitly in `beforeEach`; this is documented in the test plan
- the layered pattern teaches less about adapter swappability than hexagonal; there are
  no port interfaces — the service imports the repo module directly

Neutral:
- the in-memory store means the example cannot demonstrate migrations or schema
  evolution; those concerns are deferred to a future example

## alternatives considered

| alternative | why not chosen |
|---|---|
| Pages Router instead of App Router | Pages Router is the legacy Next.js model; App Router is the current default and the direction of the framework. Teaching Pages Router would confuse developers starting new projects today. |
| hexagonal architecture (ports and adapters) | pure functions with direct imports already give clean layer separation; adding explicit port interfaces for a six-endpoint service adds indirection without proportional teaching value; the `hello-todo-go` example already covers hexagonal |
| NestJS instead of Next.js | the `hello-todo-nestjs` example already covers NestJS; this example specifically targets the App Router audience |
| Zod for validation | a single entity with five fields does not justify a runtime dependency; manual validation is readable and self-explanatory at this scale |
| Express alongside Next.js for the API | Next.js route handlers are the idiomatic API layer; adding Express would split the example into two frameworks without teaching benefit |
| React Server Actions for mutations | Server Actions add client/server coupling that obscures the API contract; a plain JSON route handler is clearer for a reference that must be exercised with curl |

## links

- PRD: `../../requirements/prd.md` — non-goals (no auth, in-memory only)
- system design: `../system-design.md` — component breakdown and data flow
- architecture reference: `code-architectures/layered-architecture.md` (system repo root)
- tech stack: `../tech-stack.md` — version pins
