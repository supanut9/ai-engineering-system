# tech stack — hello-todo-fastify

| layer | choice | version | notes |
|---|---|---|---|
| language | TypeScript | 6.0.3 | latest stable as of 2026-05-16; ESM output (`"type":"module"` in package.json) |
| runtime | Node.js | 22 LTS | current LTS; used in CI via `actions/setup-node@v5` |
| http framework | Fastify | 5.8.5 | high-throughput framework; first-class TypeScript; schema validation via type provider |
| schema / validation | Zod | 4.4.3 | used only at the HTTP boundary (inbound adapter); `fastify-type-provider-zod` wires schemas to Fastify's type system |
| type provider | `fastify-type-provider-zod` | 6.1.0 | bridges Zod schemas and Fastify's generic route types; enables typed `request.body` |
| logging | pino | 10.3.1 | Fastify's default logger; JSON to stdout; `pino-pretty` for development |
| id generation | `uuid` | 11.1.0 | UUID v4 for server-assigned todo ids |
| storage | in-memory map | — | `Map<string, Todo>` inside `MemoryTodoRepository`; no external storage dependency |
| http testing | `fastify.inject()` | Fastify built-in | fires test requests against the Fastify app without opening a real socket |
| unit/integration testing | Vitest | 4.1.6 | fast Vite-based test runner; compatible with ESM; replaces Jest for TypeScript ESM projects |
| build | `tsc` | 6.0.3 | compiles to `dist/` with ESM output; strict mode enabled |
| dev runner | `tsx` | 4.22.0 | runs TypeScript directly in development without a separate compile step |
| ci | GitHub Actions | — | see `.github/workflows/ci.yml`; runs `npm ci`, `npm test`, `npm run build` |

---

## notes

### validation placement

Zod schemas live exclusively in `src/adapters/inbound/http/schemas.ts`. The core
service and ports have no Zod imports. This enforces the hexagonal boundary: the
HTTP adapter handles I/O shaping; the core handles business rules.

### ESM module system

`package.json` sets `"type":"module"`. All source files use ES module imports with
`.js` extensions (TypeScript resolves `.ts` → `.js` for `tsc` compatibility). Vitest
is configured with `environment: "node"` and handles ESM natively.

### no external dependencies at runtime beyond framework

All runtime imports are Fastify, its plugins, Zod, pino, and uuid. No ORM, no DI
container library, no class decoration runtime (no `reflect-metadata`).

### typescript strict mode

`tsconfig.json` enables `strict: true` (includes `strictNullChecks`,
`noImplicitAny`, `strictFunctionTypes`). This catches the `string | null` vs
`string | undefined` distinction that is essential for correct PATCH semantics.

### future additions (out of scope for v0.1.0)

| capability | candidate | when |
|---|---|---|
| persistent storage | custom adapter implementing `TodoRepository` port with `postgres` or `better-sqlite3` | v0.2.0 |
| metrics | `prom-client` + Fastify plugin | when observability is required |
| distributed tracing | `@opentelemetry/api` | when tracing is required |
| containerization | `Dockerfile` multi-stage build (Node 22 alpine) | when CI deploy is added |
| OpenAPI spec | `@fastify/swagger` (already in `package.json`) | v0.2.0 or when consumers need a spec file |
