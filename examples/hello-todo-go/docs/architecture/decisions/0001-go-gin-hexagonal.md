# ADR 0001: use Go + Gin + hexagonal architecture

## status

Accepted
Date: 2026-05-15

## context

Problem:
- The ai-engineering-system needs one fully filled-in reference example that demonstrates
  the 8-phase workflow for a real HTTP API.
- The example must be small enough to read in full, but architecturally rich enough to
  teach meaningful patterns.

Constraints:
- The service must be a single binary with no external runtime dependencies.
- It must exercise the hexagonal architecture pattern documented in
  `code-architectures/hexagonal-architecture.md`.
- Implementation must complete in one focused developer-day.

Forces at play:
- Simplicity: fewer moving parts means the architecture is easier to see.
- Teaching value: the example should show port/adapter boundaries clearly.
- Go ecosystem familiarity: Go is the primary backend language in the ai-engineering-system
  stacks; the `go.md` stack profile is the most complete.
- Dependency minimalism: no ORM, no external DB, no message queue reduces noise.

## decision

Use Go 1.23 with the Gin v1.10.0 HTTP framework, organized as a hexagonal
(ports-and-adapters) architecture. The core domain (`internal/core/todo/`) is isolated
from HTTP and storage concerns via two port interfaces: `ports/inbound/todo.go` (what
handlers call) and the outbound `Repository` interface (what the service calls).
The outbound interface and its `ErrNotFound` sentinel are defined in
`core/todo/repository.go` and re-exported from `ports/outbound/todo_repository.go`
as a type alias — this avoids the import cycle that would otherwise arise because
`Repository` signatures reference `*core/todo.Todo`. The inbound port likewise defines
its own `TodoItem` read-side DTO so it does not import the domain package. Storage is
an in-memory adapter that implements the outbound port. This makes the architecture
boundaries explicit and swappable without any external library.

See `../system-design.md` for the full component breakdown and ASCII diagram.

## consequences

Positive:
- the port interfaces enforce the dependency inversion principle in a visible way
- swapping the in-memory adapter for a database adapter (v0.2.0) requires no changes
  to the core service
- the example teaches adapter isolation, which is the primary goal of the hexagonal
  pattern reference in the system
- Gin reduces routing boilerplate, keeping handlers short and readable

Negative:
- hexagonal introduces more files and interfaces than a simple layered structure; a
  beginner might find it intimidating for a 100-line domain
- Gin is an external dependency; a pure `net/http` solution would have zero third-party
  imports

Neutral:
- the in-memory store means the example cannot demonstrate migrations or schema
  evolution; those concerns are deferred to a future example

## alternatives considered

| alternative | why not chosen |
|---|---|
| `net/http` stdlib only | verbose routing and JSON handling for a teaching example; adds noise that obscures the architecture; Gin is more widely recognized |
| Echo framework | functionally comparable to Gin; Gin has higher adoption and more existing examples in the Go ecosystem; no meaningful advantage for this example |
| layered architecture (handler → service → repo as plain packages) | fewer files, but teaches less about adapter swappability; the system's hexagonal reference would remain abstract without a concrete example |
| clean architecture (use-cases, entities, interfaces, infrastructure rings) | too many layers for a service with one entity and six endpoints; increases example complexity without proportional teaching value |

## links

- PRD: `../../requirements/prd.md` — non-goals (no auth, in-memory only)
- system design: `../system-design.md` — component breakdown and data flow
- architecture reference: `code-architectures/hexagonal-architecture.md` (system repo root)
- tech stack: `../tech-stack.md` — version pins
