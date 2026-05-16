# ADR 0001: use TypeScript + Fastify + hexagonal architecture + Zod

## status

Accepted
Date: 2026-05-16

## context

Problem:
- The ai-engineering-system has `hello-todo-go` as a fully filled-in Go reference
  example. Teams on the Node.js/TypeScript stack need an equivalent counterpart that
  demonstrates the same 8-phase workflow for the same problem domain.
- The counterpart must have an identical API surface so that documentation and curl
  examples transfer directly between examples.
- It must be small enough to read in full, but architecturally rich enough to teach
  meaningful patterns.

Constraints:
- The service must be a single Node.js process with no external runtime dependencies.
- It must exercise the hexagonal architecture pattern documented in
  `code-architectures/hexagonal-architecture.md`, mirroring `hello-todo-go`'s structure.
- Implementation must complete in one focused developer-day.
- TypeScript strict mode must be enabled throughout.

Forces at play:
- Parity with `hello-todo-go`: matching the hexagonal boundaries teaches the same
  lesson (port/adapter swappability) regardless of runtime.
- Simplicity: fewer moving parts means the architecture is easier to see.
- TypeScript ecosystem familiarity: Fastify, Zod, and Vitest are widely used and
  well-documented.
- Dependency minimalism: no ORM, no DI container, no external DB reduces noise.

## decision

Use TypeScript 6.0+ on Node 22 with Fastify 5.x as the HTTP framework, organized as a
hexagonal (ports-and-adapters) architecture. The core domain (`src/core/todo/`) is
isolated from HTTP and storage concerns via two port interfaces:
`ports/inbound/todo-service.port.ts` (what route handlers call) and
`ports/outbound/todo-repository.port.ts` (what the service calls). The service class
lives in `src/core/todo/todo-service.ts` and is instantiated in `src/index.ts`
(composition root). Storage is a `MemoryTodoRepository` implementing the outbound port.

Zod schemas are used **only** in the inbound HTTP adapter
(`src/adapters/inbound/http/schemas.ts`), wired to Fastify via
`fastify-type-provider-zod`. This gives typed `request.body` in route handlers while
keeping Zod out of the core domain. Business validation (title length, trim, RFC3339
format) lives in the service, not in Zod schemas, so the rule is enforced regardless
of how many inbound adapters exist.

See `../system-design.md` for the full component breakdown and ASCII diagram.

## consequences

Positive:
- the port interfaces enforce the dependency inversion principle in a visible, idiomatic
  TypeScript way (structural typing; no decorators needed)
- swapping the in-memory adapter for a database adapter (v0.2.0) requires no changes
  to the core service or inbound handler
- the example teaches adapter isolation, which is the primary goal of the hexagonal
  pattern reference in the system
- `fastify-type-provider-zod` gives end-to-end type safety from the Zod schema to the
  handler's `request.body` type without a separate validation pipe or decorator

Negative:
- hexagonal introduces more files and interfaces than a simple layered structure; a
  beginner might find it intimidating for a 100-line domain
- Fastify is an external dependency; a pure `node:http` solution would have zero
  third-party imports, but routing boilerplate would obscure the architecture

Neutral:
- the in-memory store means the example cannot demonstrate migrations or schema
  evolution; those concerns are deferred to a future example
- UUID v4 ids are not time-ordered; this is acceptable for an in-memory example where
  insertion order is tracked by the Map

## alternatives considered

| alternative | why not chosen |
|---|---|
| Express | no built-in TypeScript type provider; requires `@types/express`; verbose route typing without a schema validation integration; Fastify is measurably faster and has better first-class TS support |
| NestJS + hexagonal | NestJS's own DI, decorator, and module conventions are sufficiently different from the Go hexagonal layout that the parallel would be harder to draw; `hello-todo-nestjs` already exists as the NestJS reference |
| class-validator (instead of Zod) | decorator-based; requires `reflect-metadata` and `emitDecoratorMetadata`; not ESM-native; Zod schemas are plain values that compose naturally with `fastify-type-provider-zod` |
| layered architecture (controller → service → repo as plain classes) | fewer files, but teaches less about adapter swappability; the system's hexagonal reference would remain abstract without a concrete TypeScript example |
| clean architecture (use-cases, entities, interfaces, infrastructure rings) | too many layers for a service with one entity and six endpoints; increases example complexity without proportional teaching value |

## links

- PRD: `../../requirements/prd.md` — non-goals (no auth, in-memory only)
- system design: `../system-design.md` — component breakdown and data flow
- architecture reference: `code-architectures/hexagonal-architecture.md` (system repo root)
- tech stack: `../tech-stack.md` — version pins
