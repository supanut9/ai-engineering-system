# ADR 0001: use Python + FastAPI + layered architecture

## status

Accepted
Date: 2026-05-16

## context

Problem:
- The ai-engineering-system has one fully filled-in reference example (`hello-todo-go`)
  that demonstrates the 8-phase workflow using Go and hexagonal architecture.
- A second example using a different language and architectural style broadens the
  coverage and gives developers a concrete reference for the Python stack.
- The example must be small enough to read in full, but complete enough to teach
  meaningful patterns.

Constraints:
- The service must run as a single process with no external runtime dependencies.
- It must exercise the layered architecture pattern documented in
  `code-architectures/layered.md`.
- The API contract must be identical to `hello-todo-go`: same six endpoints, same entity
  shape, same error envelope.
- Implementation must complete in one focused developer-day.

Forces at play:
- Simplicity: fewer moving parts means the architecture is easier to see.
- Teaching value: the example should show layer boundaries and dependency direction.
- Python ecosystem familiarity: Python + FastAPI is a common and growing backend stack.
- Dependency minimalism: no ORM, no external DB, no message queue reduces noise.
- Contrast with `hello-todo-go`: using a different architecture style (layered vs
  hexagonal) makes both examples more useful together.

## decision

Use Python 3.12 with the FastAPI 0.136.1 HTTP framework, organised as a layered
architecture with four layers: `api/` (HTTP handlers), `services/` (business logic),
`repositories/` (storage adapters), and `models/` (Pydantic models). The service
depends on the `TodoRepository` Protocol; the `MemoryTodoRepository` implements it.
The exception handler in `main.py` maps Pydantic `RequestValidationError` and the
custom `TodoNotFoundError` to the uniform error envelope.

See `../system-design.md` for the full component breakdown and ASCII diagram.

## consequences

Positive:
- the layered structure enforces a clear dependency direction (api → services →
  repositories → models) without requiring port interfaces or adapter packages
- fewer files than hexagonal; a beginner can scan the entire `src/` tree in minutes
- FastAPI's automatic OpenAPI docs (`/docs`) are a useful bonus for exploring the API
  during development
- Pydantic v2 handles request validation, response serialisation, and settings loading
  from one library
- swapping the in-memory repository for a database-backed repository (v0.2.0) requires
  only implementing the `TodoRepository` Protocol and updating the wiring in `main.py`

Negative:
- layered architecture teaches less about adapter swappability than hexagonal; the
  `hello-todo-go` example demonstrates that pattern more explicitly
- FastAPI is an external dependency; a pure `http.server` + stdlib solution would have
  no third-party imports

Neutral:
- the in-memory store means the example cannot demonstrate migrations or schema
  evolution; those concerns are deferred to a future example
- FastAPI's `RequestValidationError` returns 422 (Unprocessable Entity) rather than 400
  (Bad Request); this is the correct HTTP status for semantic validation errors and
  is documented in the functional spec

## alternatives considered

| alternative | why not chosen |
|---|---|
| Flask | synchronous by default; requires more boilerplate for request parsing and validation; FastAPI is more widely adopted for new Python services and has better async support |
| Django REST Framework | heavy for a six-endpoint example; Django's ORM assumptions add noise; FastAPI is lighter and more focused |
| hexagonal architecture (same as hello-todo-go but in Python) | would produce a near-identical structural example; using layered adds contrast and teaches a different pattern; `hello-todo-go` already covers hexagonal |
| aiohttp | lower-level than FastAPI; requires more manual routing and validation wiring; FastAPI reduces boilerplate without hiding the architecture |
| structlog instead of logging stdlib | adds a dependency; the stdlib `logging` module with a simple JSON formatter is sufficient for this example |

## links

- PRD: `../../requirements/prd.md` — non-goals (no auth, in-memory only)
- system design: `../system-design.md` — component breakdown and data flow
- tech stack: `../tech-stack.md` — version pins
- counterpart example: `examples/hello-todo-go/docs/architecture/decisions/0001-go-gin-hexagonal.md`
