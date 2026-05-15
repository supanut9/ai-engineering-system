# ADR 0001: use NestJS + layered architecture

## status

Accepted
Date: 2026-05-16

## context

Problem:
- The ai-engineering-system needs a NestJS reference example that demonstrates the
  8-phase workflow for a real HTTP API and serves as a counterpart to `hello-todo-go`.
- The example must be small enough to read in full, but architecturally rich enough to
  teach meaningful NestJS patterns.

Constraints:
- The service must run as a single Node.js process with no external runtime dependencies.
- It must exercise the nestjs-layered architecture pattern documented in
  `code-architectures/layered-architecture.md`.
- Implementation must complete in one focused developer-day.

Forces at play:
- Simplicity: fewer moving parts means the architecture is easier to see.
- Teaching value: the example should show NestJS's DI container, decorators, and module
  system working together in a practical layered structure.
- Idiomatic NestJS: the nestjs-layered template is the canonical NestJS pattern in the
  ai-engineering-system; the example should match it faithfully.
- Dependency minimalism: no ORM, no external DB, no message queue reduces noise.

## decision

Use NestJS 11 with TypeScript 5.x, organized as a layered architecture with the
following layers, each implemented as NestJS modules:

1. **controllers** (HTTP adapter layer): decode requests, delegate to services, encode
   responses. No business logic.
2. **services** (business logic layer): validation beyond class-validator, PATCH
   null-vs-absent semantics, error propagation via typed exceptions.
3. **repositories** (persistence layer): `Map<string, Todo>` with insertion-order
   tracking; id generation via `crypto.randomBytes`.

Validation uses `class-validator` decorators on DTO classes, wired via `ValidationPipe`
per-route on write endpoints.

A global `ApiErrorFilter` catches all exceptions and maps them to the uniform error
envelope.

See `../system-design.md` for the full component breakdown and ASCII diagram.

## consequences

Positive:
- the controller/service/repository split is the most widely taught NestJS pattern;
  developers familiar with the framework will recognize the structure immediately
- NestJS's DI container makes the layers explicit and testable in isolation via
  `Test.createTestingModule`
- `class-validator` removes repetitive manual validation code and integrates natively
  with the framework's `ValidationPipe`
- swapping the in-memory repository for a database adapter (v0.2.0) requires only a
  new `@Injectable()` class registered in `TodosModule` — no controller or service
  changes

Negative:
- layered architecture teaches less about adapter swappability than hexagonal; there
  are no port interfaces — the service imports the repository class directly
- NestJS framework magic (decorators, metadata, DI tokens) requires `reflect-metadata`
  and `emitDecoratorMetadata: true`, which adds a small bootstrap overhead

Neutral:
- the in-memory store means the example cannot demonstrate migrations or schema
  evolution; those concerns are deferred to a future example

## alternatives considered

| alternative | why not chosen |
|---|---|
| hexagonal architecture (ports and adapters) | NestJS's module + DI system already encodes adapter separation; adding explicit port interfaces for a six-endpoint service adds indirection without proportional teaching value; the `hello-todo-go` example already covers hexagonal |
| Fastify platform instead of Express | Express is the NestJS default; switching to Fastify changes the adapter without affecting any architecture lesson; not the focus of this example |
| clean architecture (use-cases, entities, interfaces, infrastructure rings) | too many layers for a service with one entity and six endpoints; increases example complexity without teaching benefit |
| raw Express / Fastify without NestJS | defeats the purpose of the nestjs-layered template; no DI container, no modules, no decorators to demonstrate |
| manual validation instead of class-validator | class-validator is the standard NestJS validation approach; manual validation would produce longer, less idiomatic code and obscure the architecture |

## links

- PRD: `../../requirements/prd.md` — non-goals (no auth, in-memory only)
- system design: `../system-design.md` — component breakdown and data flow
- architecture reference: `code-architectures/layered-architecture.md` (system repo root)
- tech stack: `../tech-stack.md` — version pins
