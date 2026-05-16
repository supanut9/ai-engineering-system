# project brief — hello-todo-fastify

> This is an intentional reference example for the ai-engineering-system. It is not a
> production starter. Read it to understand what a complete phase-0 project-brief looks
> like for a small Node.js/TypeScript HTTP service.

## problem

Developers adopting the ai-engineering-system need a concrete, end-to-end example that
shows what every workflow phase looks like when filled in for a real (if tiny) project.
The existing `hello-todo-go` example covers Go + Gin; a TypeScript counterpart using
Fastify + hexagonal architecture fills the gap for teams on the Node.js stack.

## target users

Developers learning the ai-engineering-system who want a reference they can compare
against their own phase artifacts, particularly those working in TypeScript or Node.js.

## goal

Deliver a minimal, single-user, in-memory todo-list HTTP API in TypeScript (Fastify +
hexagonal architecture) that walks Phase 0 through Phase 8 of the ai-engineering-system
workflow. The service must be a direct structural counterpart to `hello-todo-go`: same
API surface, same port, same error envelope, same hexagonal layer boundaries — only the
language and framework differ.

## non-goals

- persistent storage (in-memory only for v0.1.0)
- authentication or multi-tenancy
- a frontend or CLI client
- production-grade observability (metrics, tracing)
- deployment infrastructure beyond a single Node process

## success measure

- all 6 REST endpoints respond correctly to happy-path and error requests
- `npm test` (Vitest) passes from a clean checkout
- a developer new to the system can read the example docs in under 30 minutes and
  understand how the phases connect
- the API shape is byte-for-byte compatible with `hello-todo-go` so a client written
  against either example works against the other

## key risks

| risk | likelihood | mitigation |
|---|---|---|
| example bit-rots as Fastify/Zod/Vitest versions update | medium | pin exact versions in `package.json`; dependabot on CI |
| example grows too complex and loses clarity | low | enforce one-day scope cap; reject scope additions |
| hexagonal structure feels over-engineered in TS | low | ADR-0001 explains the choice and what it teaches |

## time and scope cap

v0.1.0 ships in one focused day for a single developer. Scope is fixed: six HTTP
endpoints, one entity, in-memory storage, no auth. Any additions are deferred to v0.2.0
or later.
