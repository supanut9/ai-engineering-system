# tech stack — hello-todo-nestjs

| layer | choice | version | notes |
|---|---|---|---|
| language | TypeScript | ^5.8.3 | latest stable as of 2026-05-16; NestJS 11 has compatibility constraints; use 5.x |
| runtime | Node.js | 22 LTS | current LTS; used in CI via `actions/setup-node@v5` |
| http framework | NestJS | ^11.1.21 | opinionated framework with built-in DI container, decorators, and module system |
| http platform | `@nestjs/platform-express` | ^11.1.21 | Express adapter; default NestJS platform |
| validation | `class-validator` | ^0.15.1 | decorator-based validation on DTOs; wired via `ValidationPipe` |
| transformation | `class-transformer` | ^0.5.1 | required by `class-validator`; enables `transform: true` on `ValidationPipe` |
| storage | in-memory map | — | `Map<string, Todo>` inside `TodosRepository`; no external storage dependency |
| logging | NestJS Logger | stdlib | structured logging to stdout; no third-party logging library needed for v0.1.0 |
| id generation | `crypto` | Node stdlib | `crypto.randomBytes(16).toString('hex')` produces 32-char hex ids |
| http testing | `supertest` | ^7.2.2 | HTTP assertions over the NestJS test server |
| unit testing | Jest + ts-jest | ^29.7.0 / ^29.4.0 | standard Jest runner with TypeScript support |
| ci | GitHub Actions | — | see `.github/workflows/ci.yml`; runs `npm ci`, `npm test`, `npm run build` |

---

## notes

### validation approach

`class-validator` + `class-transformer` are used via NestJS's `ValidationPipe`. The
pipe is applied per-route on write endpoints (not globally) to keep read endpoints
lean. The pipe is configured with `{ whitelist: true, transform: true }` to strip
unknown fields and coerce types.

### no external dependencies at runtime

All runtime imports are NestJS framework packages + `reflect-metadata` + `rxjs`.
`class-validator` and `class-transformer` are also runtime (not dev-only) because the
ValidationPipe uses them at request time.

### typescript compatibility

NestJS 11 is tested against TypeScript 5.x. TypeScript 6.x (now available) may have
breaking changes; this example pins `^5.8.3` until NestJS 11 publishes compatibility
notes for TS 6.

### future additions (out of scope for v0.1.0)

| capability | candidate | when |
|---|---|---|
| persistent storage | `@nestjs/typeorm` + SQLite or Postgres | v0.2.0 |
| config module | `@nestjs/config` | when multiple env vars are needed |
| metrics | `prom-client` + custom interceptor | when observability is required |
| distributed tracing | `@opentelemetry/api` | when tracing is required |
| containerization | `Dockerfile` multi-stage build | when CI deploy is added |
