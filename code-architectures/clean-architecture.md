# Clean Architecture

## Canonical Diagram

The most widely recognized picture for clean architecture is the concentric
circles model: inner business rules at the center, outer frameworks and
infrastructure at the edge, and dependencies pointing inward.

```text
+--------------------------------------------------------------+
|                Frameworks and Drivers                        |
|        UI, Database, External Systems, Devices               |
|                                                              |
|   +------------------------------------------------------+   |
|   |              Interface Adapters                      |   |
|   |      Controllers, Presenters, Gateways              |   |
|   |                                                      |   |
|   |   +----------------------------------------------+   |   |
|   |   |         Use Cases / Application              |   |   |
|   |   |      Application Business Rules              |   |   |
|   |   |                                              |   |   |
|   |   |   +--------------------------------------+   |   |   |
|   |   |   |          Entities / Domain           |   |   |   |
|   |   |   |      Enterprise Business Rules       |   |   |   |
|   |   |   +--------------------------------------+   |   |   |
|   |   +----------------------------------------------+   |   |
|   +------------------------------------------------------+   |
+--------------------------------------------------------------+

Dependency rule:
outer layers may depend inward
inner layers must not depend outward
```

Reading rule:

- the center changes least
- the edge changes most
- source-code dependencies should point inward

## What It Is

Clean architecture organizes code around dependency direction rather than around
frameworks. Core business logic should not depend on transport, persistence, or
framework details.

A common shape is:

- domain
- application or use cases
- interfaces or ports
- infrastructure or adapters

## Use When

Use clean architecture when:

- business logic is important and long-lived
- frameworks may change over time
- you want strong testability around use cases
- the system has multiple adapters such as HTTP, jobs, events, and persistence
- the team can maintain the extra abstraction intentionally

## Avoid When

Avoid clean architecture when:

- the application is small and mostly straightforward CRUD
- the team will create abstractions without discipline
- delivery speed is more important than long-term framework independence
- the domain is simple enough that layered architecture is sufficient

## Core Rules

- dependencies point inward toward business logic
- domain code must not depend on frameworks
- application logic should coordinate use cases, not infrastructure details
- adapters translate between outside systems and the inner core
- ports or interfaces should exist to protect meaningful boundaries, not
  everywhere by reflex

## Typical Structure

Example shape:

```text
src/
  domain/
  application/
  ports/
  adapters/
    http/
    persistence/
    events/
```

Example Go shape:

```text
internal/
  domain/
  application/
  ports/
  adapters/
    http/
    repository/
```

## Dependency Rules

- domain depends on nothing outward
- application depends on domain
- ports are defined inward where the abstraction is needed
- adapters depend on application and domain contracts
- frameworks, databases, and transports sit at the outer edge

## Testing Implications

- domain and application layers should be easy to unit test
- adapter tests verify translation and infrastructure behavior
- integration tests confirm real persistence and transport wiring
- end-to-end tests still validate real user flows

## Strengths

- strong separation of concerns
- better protection against framework-driven design
- high unit testability for core business behavior
- easier to support multiple delivery mechanisms around the same use cases

## Weaknesses

- more files and more indirection
- easy to over-abstract simple applications
- can slow teams that do not understand the tradeoffs
- ports and adapters can become ceremony if the boundaries are weak

## Common Failure Modes

- creating interfaces for every service with no boundary value
- naming layers cleanly but still leaking framework types into the core
- treating adapters as dumping grounds
- overcomplicating simple CRUD applications
- writing abstractions before the real seams are understood

## Best Fit By Stack

- Go services: strong fit, especially for serious backend services
- NestJS: possible, but use selectively and avoid fighting the framework
- Node.js services with multiple integration points: often useful
- not usually the best default for simple UI-heavy apps

## Decision Heuristics

Choose clean architecture when:

- the business rules matter more than the framework
- you need stronger boundary enforcement than layered architecture gives
- multiple adapters and execution paths must share the same core logic

Do not choose it just because it sounds advanced. Choose it when the
independence and boundary discipline will pay for the extra complexity.
