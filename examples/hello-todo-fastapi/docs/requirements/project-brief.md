# project brief — hello-todo-fastapi

> This is an intentional reference example for the ai-engineering-system. It is not a
> production starter. Read it to understand what a complete phase-0 project-brief looks
> like for a small FastAPI HTTP service.

## problem

Developers adopting the ai-engineering-system need a concrete, end-to-end example that
shows what every workflow phase looks like when filled in for a real (if tiny) project.
Without an example, the templates remain abstract and the workflow is hard to follow.
The existing reference example (`hello-todo-go`) uses Go and hexagonal architecture.
A second example using Python and layered architecture broadens the coverage and gives
developers a choice of reference that matches their stack.

## target users

Developers learning the ai-engineering-system who want a reference they can compare
against their own phase artifacts, particularly those working in Python with FastAPI.

## goal

Deliver a minimal, single-user, in-memory todo-list HTTP API in Python (FastAPI + layered
architecture) that walks Phase 0 through Phase 8 of the ai-engineering-system workflow.
Every artifact in the example should be coherent, realistic, and useful as a model.

## non-goals

- persistent storage (in-memory only for v0.1.0)
- authentication or multi-tenancy
- a frontend or CLI client
- production-grade observability (metrics, tracing)
- deployment infrastructure beyond a single process

## success measure

- all 6 REST endpoints respond correctly to happy-path and error requests
- `pytest` passes from a clean checkout
- a developer new to the system can read the example docs in under 30 minutes and
  understand how the phases connect

## key risks

| risk | likelihood | mitigation |
|---|---|---|
| example bit-rots as FastAPI/Pydantic versions update | medium | pin versions in pyproject.toml; dependabot on CI |
| example grows too complex and loses clarity | low | enforce one-day scope cap; reject scope additions |
| layered structure confusion vs hexagonal | low | ADR-0001 explains the choice and what it teaches |

## time and scope cap

v0.1.0 ships in one focused day for a single developer. Scope is fixed: six HTTP
endpoints, one entity, in-memory storage, no auth. Any additions are deferred to v0.2.0
or later.
