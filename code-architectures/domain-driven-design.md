# Domain-Driven Design

## What It Is

Domain-driven design (DDD) is a modeling approach for complex business domains.
It focuses on shaping software around business language, business boundaries,
and domain concepts rather than around database tables or framework defaults.

DDD is not a direct replacement for layered or clean architecture. It is a
domain modeling approach that can sit on top of either.

## Use When

Use DDD when:

- the business domain is genuinely complex
- rules, policies, and edge cases drive much of the system behavior
- multiple subdomains or bounded contexts exist
- shared vocabulary between engineers and domain experts matters
- the cost of modeling pays back through clarity and correctness

## Avoid When

Avoid full DDD when:

- the application is mostly simple CRUD
- the domain is not complex enough to justify rich modeling
- the team would copy terminology without understanding the concepts
- delivery would be slowed by unnecessary modeling ceremony

In many projects, DDD-lite is enough:

- better names
- clearer boundaries
- explicit domain concepts

without forcing every tactical pattern everywhere.

## Core Rules

- use the business language consistently in code and docs
- define clear bounded contexts
- keep domain rules close to domain concepts
- separate domain concerns from transport and persistence concerns
- model entities, value objects, and domain services only when they clarify real
  business behavior
- treat repositories as domain-oriented abstractions, not generic data helpers

## Typical Structure

Example shape:

```text
src/
  domain/
    customer/
    billing/
    promotion/
  application/
  infrastructure/
  interfaces/
```

Within a bounded context:

```text
domain/
  entities/
  value-objects/
  services/
  repositories/
  policies/
```

## Dependency Rules

DDD does not force one universal dependency structure by itself.

Typical guidance:

- domain concepts should not depend on transport frameworks
- domain rules should not be spread across controllers and repositories
- bounded contexts should interact through explicit contracts
- use layered or clean architecture rules underneath as needed

## Testing Implications

- unit test domain rules heavily
- test value objects and policies as pure business behavior
- integration test repositories and context interactions
- verify important cross-context flows explicitly

## Strengths

- improves alignment between software and business language
- helps control complex business rules
- clarifies ownership boundaries
- makes hidden assumptions explicit

## Weaknesses

- easy to overdo in simple systems
- terminology can become cargo-cult if the team does not understand it
- richer modeling costs time and design effort
- bounded contexts can be modeled poorly if team ownership is unclear

## Common Failure Modes

- calling a folder `domain` without changing the design
- creating entities and aggregates for trivial data shapes
- forcing repositories, factories, or services with no real domain value
- mixing multiple bounded contexts into one vague shared model
- treating DDD as a code-style trend rather than a modeling discipline

## Best Fit By Stack

- Go: often a good fit for complex domain services
- NestJS: useful when modules align to real business contexts
- Node.js backends: useful where business workflows dominate
- any stack can use DDD, but only if the domain complexity justifies it

## Relationship To Other Styles

- layered architecture can host DDD
- clean architecture can host DDD
- DDD answers how to model the business domain
- layered and clean answer how to structure dependencies and application code

## Decision Heuristics

Choose DDD when:

- the hardest part of the system is understanding the business itself
- bugs tend to come from misunderstood rules or weak boundaries
- the domain has enough complexity to justify richer models

Do not adopt full DDD by default. Start with clear language and boundaries, and
add deeper DDD patterns only where complexity makes them worthwhile.
