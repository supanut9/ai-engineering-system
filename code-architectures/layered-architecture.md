# Layered Architecture

## What It Is

Layered architecture organizes an application into a small number of logical
layers with clear responsibilities. A common backend shape is:

- presentation or transport
- application or service
- persistence or repository

It is an internal code-organization style, not a deployment topology.

## Use When

Use layered architecture when:

- the product is mostly CRUD or workflow-oriented
- business rules are moderate in complexity
- speed of delivery matters more than strict architectural isolation
- the team wants a simple and familiar structure
- framework conventions already align well with layered code

## Avoid When

Avoid using layered architecture as the only design rule when:

- the domain is highly complex and core rules are easy to scatter
- you need strict independence from frameworks and adapters
- the codebase already suffers from god services or weak boundaries
- many use cases share rules that need stronger domain modeling

## Core Rules

- controllers or handlers should stay thin
- services should contain application flow and business rules
- repositories should handle persistence concerns only
- validation and transport mapping should stay near the edge
- avoid putting SQL, HTTP, or framework details inside service logic
- do not let repositories become business-rule containers

## Typical Structure

Example backend shape:

```text
src/
  controllers/
  services/
  repositories/
  models/
  dto/
  middleware/
```

Example Go shape:

```text
internal/
  http/
  service/
  repository/
  model/
```

## Dependency Rules

- presentation depends on services
- services may depend on repositories
- repositories depend on database or infrastructure code
- lower layers should not call higher layers back directly

This is usually a top-down dependency model.

## Testing Implications

- unit test services first
- integration test repositories and persistence behavior
- test controllers or handlers for request and response behavior
- add end-to-end coverage for critical flows

## Strengths

- simple to explain
- fast to implement
- aligns with common framework defaults
- works well for standard APIs and internal tools

## Weaknesses

- business logic can become concentrated in large service classes
- domain rules often leak across services over time
- framework and persistence concerns can creep inward
- boundaries may be conceptual rather than enforced

## Common Failure Modes

- fat controllers with business logic
- fat services that do everything
- repositories returning framework-shaped data everywhere
- cross-service copy-paste rules with no shared domain model
- layers existing in name only while dependencies sprawl

## Best Fit By Stack

- NestJS: very common fit
- standard Node.js APIs: common fit
- Go services: good for simpler business services
- Next.js server-side app logic: useful in feature or backend-like modules

## Decision Heuristics

Choose layered architecture when:

- you need the simplest maintainable structure
- the main work is API orchestration and CRUD
- the domain does not yet justify stronger modeling or stricter boundaries

Default to layered before clean architecture unless there is a clear reason to
pay for extra abstraction.
