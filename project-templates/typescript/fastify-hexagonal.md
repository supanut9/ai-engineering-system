# Fastify Hexa

## Use When

Use this blueprint when:

- the stack is TypeScript with Fastify
- the code architecture is hexagonal architecture
- the service has multiple integrations or clear inbound and outbound adapter
  boundaries
- the service relies on OIDC, event consumers, webhook dispatch, or external
  API orchestration where explicit port contracts protect the business core

## Stack

- language: TypeScript (strict mode)
- HTTP framework: Fastify 5
- schema validation: Zod 4 via `fastify-type-provider-zod`
- default database: PostgreSQL via Prisma
- logging: Pino (bundled in Fastify)
- test runner: Vitest

## Code Architecture

- style: hexagonal architecture (ports and adapters)
- the business core (`src/core/`) depends on nothing outside itself
- all infrastructure crosses the boundary through port interfaces
- inbound adapters (HTTP routes) call core through inbound ports
- outbound adapters (database, external APIs) implement outbound ports

## Bootstrap

Initial setup:

```bash
npm install
npm run dev          # starts tsx watch on src/server.ts
npm test             # vitest run
npm run build        # tsc → dist/
```

Database setup (after adding Prisma schema):

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Folder Structure

```text
src/
  server.ts
  core/
    <domain>/
      service.ts
      service.test.ts
  ports/
    inbound/
    outbound/
  adapters/
    inbound/
      http/
        routes/
    outbound/
  config/
docs/
  requirements/
  specs/
  architecture/
  plan/
  tests/
  release/
  maintenance/
.ai/
  workflow/
```

## Folder Responsibilities

- `src/server.ts` = composition root; registers plugins and wires dependencies
- `src/core/<domain>/` = protected business logic; no framework or DB imports
- `src/ports/inbound/` = TypeScript interfaces for incoming application interactions
- `src/ports/outbound/` = TypeScript interfaces for external dependencies
- `src/adapters/inbound/http/routes/` = Fastify route definitions; thin adapters only
- `src/adapters/outbound/` = concrete infrastructure adapters (Prisma, Redis, external APIs)
- `src/config/` = configuration loading, validation, and export

## Required Workflow Files

- `AGENTS.md` or `CLAUDE.md` depending on tool
- `.ai/workflow/project-context.md`
- `.ai/workflow/workflow-state.md`
- `.ai/workflow/active-task.md`

## Notes and Constraints

- Use Fastify only as an inbound adapter; never import Fastify types into core.
- Define inbound ports only where they protect real boundaries; skip them for
  trivial pass-through cases.
- All route schemas must use Zod and go through `fastify-type-provider-zod`;
  never use raw JSON schema objects.
- Config values must be loaded once in `src/config/` and injected; never read
  `process.env` inside core or adapters.
- Prefer `buildServer(): FastifyInstance` exported from `server.ts` so tests can
  call `app.inject()` without a live port.
- Add `@fastify/swagger` at project start; retrofitting it is costly.
- Outbound port interfaces live in `src/ports/outbound/`; their concrete
  implementations in `src/adapters/outbound/`.
- Prisma is the default database adapter; switch to Kysely only when the schema
  is dynamic or multi-tenant and Prisma's generated client becomes a liability.
