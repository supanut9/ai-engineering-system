# project brief — hello-todo-nextjs

> This is an intentional reference example for the ai-engineering-system. It is not a
> production starter. Read it to understand what a complete phase-0 project-brief looks
> like for a small Next.js full-stack application.

## problem

Developers adopting the ai-engineering-system need a concrete, end-to-end example that
shows what every workflow phase looks like when filled in for a real (if tiny) project.
Without an example, the templates remain abstract and the workflow is hard to follow.

## target users

Developers learning the ai-engineering-system who want a Next.js App Router reference
they can compare against their own phase artifacts and against the `hello-todo-nestjs`
reference.

## goal

Deliver a minimal, single-user, in-memory todo-list application in TypeScript (Next.js
App Router + layered architecture) that walks Phase 0 through Phase 8 of the
ai-engineering-system workflow. The app exposes a JSON API via route handlers and a
server-rendered home page that lists todos. Every artifact in the example should be
coherent, realistic, and useful as a model.

## non-goals

- persistent storage (in-memory only for v0.1.0)
- authentication or multi-tenancy
- a dedicated API-only mode or a separate frontend build step
- production-grade observability (metrics, tracing)
- deployment infrastructure beyond a Node.js process

## success measure

- all 6 REST endpoints respond correctly to happy-path and error requests
- `npm test` passes from a clean checkout
- the home page renders the todo list server-side without JavaScript errors
- a developer new to the system can read the example docs in under 30 minutes and
  understand how the phases connect

## key risks

| risk | likelihood | mitigation |
|---|---|---|
| example bit-rots as Next.js versions update | medium | pin versions in package.json; dependabot on CI |
| example grows too complex and loses clarity | low | enforce one-day scope cap; reject scope additions |
| App Router conventions confuse developers expecting Pages Router | low | ADR-0001 explains the choice and what it teaches |

## time and scope cap

v0.1.0 ships in one focused day for a single developer. Scope is fixed: six HTTP
endpoints, a server-rendered home page, one entity, in-memory storage, no auth. Any
additions are deferred to v0.2.0 or later.
