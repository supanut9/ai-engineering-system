# Stack Profile: Go

## What It Is

Go is a statically typed compiled language that works well for backend APIs,
workers, CLIs, infrastructure services, and concurrent systems.

Use Go when you want:

- simple deployment
- good performance
- predictable memory and CPU behavior
- strong support for concurrency
- a codebase that favors explicitness over framework magic

## Use When

Use Go when:

- you are building backend APIs or internal services
- the service needs reliability and operational simplicity
- background jobs, schedulers, or event consumers are important
- concurrency is part of the actual workload
- startup time, binary deployment, and infra friendliness matter
- the team is comfortable with explicit code and fewer framework shortcuts

## Avoid When

Avoid Go as the default choice when:

- the team is much more productive in another stack for the same problem
- the product is mostly frontend-heavy with only thin backend needs
- fast framework scaffolding matters more than explicit service design
- the domain is simple and the overhead of a separate Go service is not worth
  it

## Typical Use Cases

- backend API service
- worker or job processor
- realtime service
- integration service
- CLI or internal tooling

## Preferred Structure

For service code, prefer an explicit internal layout.

Simple service shape:

```text
cmd/
  api/
internal/
  config/
  http/
  service/
  repository/
  model/
tests/
```

For more complex services, use a structure that reflects the chosen code
architecture:

- layered: `http`, `service`, `repository`, `model`
- clean: `domain`, `application`, `ports`, `adapters`
- DDD: `domain/<bounded-context>`, `application`, `infrastructure`

## Framework Guidance

Go itself is the primary choice. Frameworks should stay lightweight.

## Default Framework Choice

Default HTTP framework: `Gin`

Use Gin unless:

- the project already standardizes on another Go framework
- the service is intentionally stdlib-only
- a real technical reason justifies Fiber or Echo

Why Gin is the default:

- widely used and easy to reason about
- good balance between simplicity and convenience
- common enough that AI-generated structure and examples are predictable
- fits standard API services without pushing unusual architectural patterns

General rules:

- prefer the standard library unless a framework adds clear value
- use HTTP frameworks carefully; avoid letting them shape the whole codebase
- keep router and middleware concerns at the edge
- do not let framework types leak deep into business logic

If using Gin:

- treat Gin as an adapter layer
- handlers should be thin
- request binding and response formatting should stay near the HTTP boundary

## Framework Comparison

### Gin

Default choice for most backend APIs.

Good fit when:

- you want the safest default for general services
- the team wants common patterns and broad familiarity
- you need routing, middleware, binding, and JSON handling without unusual
  tradeoffs

Tradeoffs:

- not the most minimal option
- can still encourage framework-shaped handlers if boundaries are weak

### Fiber

Alternative choice when the team intentionally prefers Fiber.

Good fit when:

- the team already knows Fiber well
- the service is strongly centered around Fiber conventions
- the ergonomics are a deliberate team preference

Tradeoffs:

- less conservative default than Gin
- different operational and ecosystem expectations from standard-library-style
  tooling
- easier to choose for novelty instead of real need

### Echo

Acceptable alternative, especially in teams already using it.

Good fit when:

- the team already has Echo conventions and utilities
- the service should align with existing Echo-based repos

Tradeoffs:

- less useful as a team-wide default if your repos are not already Echo-based
- similar category to Gin, so switching usually needs a practical reason

## Framework Decision Heuristics

Choose:

- `Gin` by default for new Go API services
- `Echo` if the team or surrounding repos already standardize on it
- `Fiber` only when the team explicitly wants it and understands the
  differences
- plain `net/http` when minimal dependencies and explicit control matter more
  than framework convenience

## Core Rules

- keep handlers thin
- keep business logic out of transport code
- pass `context.Context` explicitly
- return errors clearly and wrap them when useful
- prefer small interfaces at real boundaries only
- avoid hidden global mutable state
- prefer explicit construction over magic containers

## Configuration And Runtime

- load config explicitly at startup
- validate required config early
- support graceful shutdown
- make logging structured and consistent
- keep environment-specific wiring out of business logic

## Dependency Rules

- framework code belongs at the edge
- business logic should not depend directly on HTTP or SQL libraries
- persistence details should not leak into application rules
- choose dependency direction based on the selected code architecture

## Testing Implications

- unit test pure business logic heavily
- integration test repositories and database behavior
- test HTTP handlers for contract behavior
- test failure paths, not only happy paths
- use end-to-end checks for critical workflows when the service is user-facing

## Strengths

- strong fit for backend and infra workloads
- explicit control over code and runtime behavior
- good performance with simple deployment
- easy to package and run in containers
- good match for long-lived services

## Weaknesses

- less framework scaffolding than some other stacks
- can become verbose if the team over-abstracts
- weak design discipline leads to large packages and muddled service layers
- some teams misuse interfaces everywhere and make the code harder to follow

## Common Failure Modes

- putting too much logic in handlers
- creating interfaces before real seams exist
- building Java-style abstraction layers everywhere
- mixing transport, persistence, and business rules in one package
- hiding dependencies in globals
- ignoring context cancellation and shutdown behavior

## Best Fit By Architecture Style

### Layered Architecture

Good fit for:

- straightforward APIs
- CRUD-heavy services
- internal tools and admin services

Typical shape:

```text
internal/
  http/
  service/
  repository/
  model/
```

### Clean Architecture

Strong fit for:

- long-lived services
- important domain logic
- systems with multiple adapters such as HTTP, jobs, and events

Typical shape:

```text
internal/
  domain/
  application/
  ports/
  adapters/
```

### Domain-Driven Design

Useful when:

- the domain is actually complex
- bounded contexts matter
- business rules are the hard part of the system

Typical shape:

```text
internal/
  domain/
    <bounded-context>/
  application/
  infrastructure/
```

DDD should usually complement layered or clean architecture rather than replace
them.

## Decision Heuristics

Choose Go when:

- the service is backend-heavy
- concurrency or runtime efficiency matters
- you want a clear service boundary with simple deployment

Within Go:

- start with layered architecture for simpler services
- choose clean architecture when business logic or adapter complexity justifies
  stronger boundaries
- add DDD only when the domain complexity is real
