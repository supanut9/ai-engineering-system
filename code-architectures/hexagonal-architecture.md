# Hexagonal Architecture

## What It Is

Hexagonal architecture organizes an application around a protected core and a
set of ports and adapters.

The core contains the business behavior. The outside world interacts with the
core through:

- inbound ports and inbound adapters
- outbound ports and outbound adapters

It is closely related to clean architecture, but it emphasizes interaction
boundaries and adapter design more explicitly.

## Use When

Use hexagonal architecture when:

- the system has multiple ways to enter the core such as HTTP, jobs, CLI, or
  events
- the system depends on external services, databases, or message systems that
  should stay at the edge
- you want a very explicit ports-and-adapters mental model
- testability and replacement of adapters matter

## Avoid When

Avoid hexagonal architecture when:

- the service is simple enough that layered architecture is sufficient
- the team does not need explicit inbound and outbound boundary modeling
- the ports and adapters would add more ceremony than value
- the codebase is likely to create interfaces with no meaningful separation

## Core Rules

- keep the business core independent from adapters
- define ports where the core needs to communicate inward or outward
- use adapters to translate between the outside world and the core
- keep framework, HTTP, SQL, and vendor SDK details outside the core
- create ports only for real boundaries, not as boilerplate everywhere

## Typical Structure

Example shape:

```text
internal/
  core/
  ports/
    inbound/
    outbound/
  adapters/
    inbound/
      http/
      jobs/
    outbound/
      postgres/
      redis/
      external-api/
```

Alternative Go-friendly shape:

```text
internal/
  domain/
  application/
  ports/
    inbound/
    outbound/
  adapters/
    inbound/http/
    outbound/repository/
```

## Dependency Rules

- the core must not depend on adapters
- inbound adapters call inbound ports
- outbound ports are defined by the core or application layer
- outbound adapters implement outbound ports
- dependencies point toward the core

## Testing Implications

- unit test the core without framework dependencies
- test inbound adapters for translation and request handling
- test outbound adapters against real integration behavior
- use adapter fakes or mocks only at real boundaries

## Strengths

- strong boundary clarity
- good fit for multi-entry or multi-integration systems
- protects business logic from infrastructure churn
- makes adapter responsibilities explicit

## Weaknesses

- more moving parts than layered architecture
- easy to over-design simple services
- can become interface-heavy if used without discipline
- naming can confuse teams that do not share the mental model

## Common Failure Modes

- creating ports for everything
- mixing adapter code back into the core
- using hexagonal names without enforcing dependency direction
- treating repositories or services as adapters without clear boundaries
- building a complex shell around a trivial service

## Best Fit By Stack

- Go: very strong fit, especially for services with multiple integrations
- NestJS: possible, but often heavier than needed
- Node.js backends: useful in integration-heavy systems, but usually not the
  first default

## Relationship To Other Styles

- hexagonal and clean architecture overlap heavily
- clean architecture emphasizes dependency direction and inner/outer layers
- hexagonal architecture emphasizes ports and adapters around the core
- DDD can sit on top of hexagonal architecture when the domain is complex

## Decision Heuristics

Choose hexagonal architecture when:

- you want more explicit adapter boundaries than standard clean architecture
  examples usually show
- the service has multiple entry points or integration surfaces
- modeling inbound and outbound ports clearly will reduce confusion

Do not choose it just because the name sounds more advanced. Use it when the
ports-and-adapters structure is actually helpful.
