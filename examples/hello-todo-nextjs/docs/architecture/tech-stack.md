# tech stack — hello-todo-nextjs

| layer | choice | version | notes |
|---|---|---|---|
| language | TypeScript | ^5.8.3 | latest stable as of 2026-05-16; Next.js 15 is compatible with TS 5.x |
| runtime | Node.js | 22 LTS | current LTS; used in CI via `actions/setup-node@v5` |
| http framework | Next.js | ^15.3.2 | App Router; server components + route handlers; `next dev` for development, `next start` for production |
| react | React | ^19.0.0 | peer dependency of Next.js 15; server components require React 19 |
| storage | in-memory map | — | `Map<string, Todo>` in `src/lib/repo.ts`; no external storage dependency |
| logging | console | Node stdlib | `console.log` / `console.error` to stdout; Next.js logs HTTP requests automatically |
| id generation | `crypto` | Node stdlib | `crypto.randomBytes(16).toString('hex')` produces 32-char hex ids |
| unit testing | Vitest | ^3.1.4 | compatible with Next.js; ES module support out of the box; faster than Jest for this use case |
| component testing | @testing-library/react | ^16.3.0 | server component rendering assertions |
| ci | GitHub Actions | — | see `.github/workflows/ci.yml`; runs `npm ci`, `npm test`, `next build` |

---

## notes

### validation approach

Validation is performed manually in `src/services/todos.ts`. Input constraints (non-empty
title after trim, max 200 chars, ISO8601 `due_at`) are checked with small guard
functions. This avoids a runtime dependency on a validation library, which would add
friction without commensurate teaching value for a service with one entity. A real
production project would likely adopt Zod or Valibot here.

### no DI container

Next.js does not ship a dependency injection container. `src/services/todos.ts` imports
`src/lib/repo.ts` directly as a module import. This keeps the code straightforward and
is idiomatic Next.js. Testing swaps the repo by resetting module-level state (the
in-memory Map) in `beforeEach`, rather than injecting a mock.

### no external dependencies at runtime

All runtime imports are Next.js framework packages + React. The only Node stdlib module
used at runtime is `crypto` (for id generation). There are no ORM packages, validation
libraries, or logging frameworks required.

### typescript compatibility

Next.js 15 is tested against TypeScript 5.x. This example pins `^5.8.3` to stay
aligned with the rest of the ai-engineering-system reference examples.

### future additions (out of scope for v0.1.0)

| capability | candidate | when |
|---|---|---|
| persistent storage | Prisma + SQLite or Postgres | v0.2.0 |
| validation library | Zod | when number of validated shapes grows |
| metrics | `prom-client` + custom route handler | when observability is required |
| distributed tracing | `@opentelemetry/api` | when tracing is required |
| containerization | `Dockerfile` multi-stage build | when CI deploy is added |
| client-side interactivity | React Server Actions | when mutation from UI is needed |
