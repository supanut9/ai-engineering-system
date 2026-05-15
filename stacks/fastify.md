# Fastify

## When to Use

Use Fastify when:

- you are building a TypeScript backend API or internal service
- the service needs strong runtime validation and auto-generated OpenAPI docs
- the team is already working in Node.js or TypeScript
- OIDC integration, webhook handling, or third-party API orchestration is central
- deployment targets a serverless or container runtime where startup time matters

Avoid Fastify when:

- the workload is purely static or edge-rendered (prefer Next.js)
- the team needs NestJS DI and module conventions for a large long-lived monolith
- a full DDD/CQRS infrastructure is needed from day one

## Default Dependencies

| Package | Version | Role |
|---|---|---|
| `fastify` | 5.8.5 | HTTP framework |
| `@fastify/cors` | 11.2.0 | CORS middleware |
| `@fastify/helmet` | 13.0.2 | Security headers |
| `@fastify/swagger` | 9.7.0 | OpenAPI spec generation |
| `fastify-type-provider-zod` | 6.1.0 | Wires Zod schemas to Fastify type provider |
| `zod` | 4.4.3 | Schema definition and runtime validation |
| `pino` | 10.3.1 | Structured JSON logging (bundled in Fastify) |
| `pino-pretty` | 13.1.3 | Human-readable log formatting for development |
| `prisma` | 7.8.0 | ORM and migration tooling (dev dependency) |
| `@prisma/client` | 7.8.0 | Generated type-safe database client |
| `typescript` | 6.0.3 | Language toolchain |
| `tsx` | 4.22.0 | TypeScript execution for development |
| `@types/node` | 25.8.0 | Node.js type definitions |
| `vitest` | 4.1.6 | Unit and integration test runner |

## Conventions

Use hexagonal architecture by default. Project layout summary:

```text
src/
  server.ts           # composition root
  core/<domain>/      # protected business logic; no framework imports
  ports/inbound/      # contracts for incoming interactions
  ports/outbound/     # contracts for external dependencies
  adapters/inbound/http/routes/   # Fastify route definitions
  adapters/outbound/  # concrete infrastructure adapters
  config/             # configuration loading and validation
docs/{requirements,specs,architecture,plan,tests,release,maintenance}/
.ai/workflow/
```

- **Env config**: load and validate all config in `src/config/` at startup; never read `process.env` inside core or adapters.
- **Logging**: use `request.log` in route handlers and `server.log` elsewhere; enable `pino-pretty` via `LOG_PRETTY=true` in development only.
- **Error envelope**: `{ "error": "NotFound", "message": "...", "statusCode": 404 }`. Map domain errors to HTTP codes in a global `setErrorHandler`, not in business logic.
- **OpenAPI**: register `@fastify/swagger` in `server.ts`; co-locate Zod schemas with their routes via `fastify-type-provider-zod`; expose at `GET /documentation/json`.

## Testing

Use Vitest. Unit-test service classes directly. For HTTP tests use `fastify.inject`:

```typescript
const app = buildServer()
const res = await app.inject({ method: 'GET', url: '/healthz' })
expect(res.statusCode).toBe(200)
```

- unit tests: alongside their module (`service.test.ts`)
- integration tests: `tests/` at project root
- CI: `vitest run`; watch mode: `vitest`

## Database

**Default: Prisma** for services with a stable, known schema. Define the schema in `prisma/schema.prisma`, generate the client with `npx prisma generate`, and import `PrismaClient` as a singleton in `src/adapters/outbound/prisma.ts`.

**Alternative: Kysely** when the schema is dynamic or multi-tenant and Prisma's generated client adds more friction than value.

Never use both in the same service. Choose one at project bootstrap.

## Migration Strategy

```bash
npx prisma migrate dev --name <description>   # create and apply in development
npx prisma migrate deploy                     # apply pending in production
npx prisma migrate reset                      # reset dev database (destructive)
```

Keep `prisma/migrations/` committed to version control.

## Build and Run

```bash
npm run dev        # tsx watch src/server.ts  (hot reload)
npm run typecheck  # tsc --noEmit
npm run build      # tsc → dist/
npm start          # node dist/server.js
```

`tsconfig.json`: `"module": "NodeNext"`, `"outDir": "dist"`, `"strict": true`.

## Common Pitfalls

- Forgetting to `await server.ready()` before calling `inject` in tests.
- Letting Prisma types leak into core services; wrap them in domain types.
- Registering plugins after routes; always register plugins first.
- Using `any` to work around Zod type inference; tighten the schema instead.
- Not calling `server.close()` in test teardown; this leaks open handles.

## See Also

- Blueprint: `project-templates/typescript/fastify-hexagonal.md`
- Code architecture reference: `code-architectures/hexagonal.md`
- Standards: `standards/api.md`, `standards/logging.md`, `standards/testing.md`
