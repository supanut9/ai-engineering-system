---
name: architecture-design
description: Use when designing system architecture, service boundaries, data flow, technical tradeoffs, and architecture decision records.
---

# architecture design

Phase 3 of the AI Engineering System workflow (v0.0.1).
Reference: `../../workflow/ai-workflow.md`, `../../workflow/phase-gates.md`.

## when to use

- Phase 2 functional spec is complete and requirements are stable.
- A user says "design the architecture", "pick the tech stack", or "how should we structure this service".
- The system has non-trivial components, integrations, or data flows that need explicit mapping before coding starts.

## what to produce

| Artifact | Path |
|---|---|
| System design | `docs/architecture/system-design.md` |
| Tech stack | `docs/architecture/tech-stack.md` |
| Architecture decision records | `docs/architecture/decisions/NNNN-<slug>.md` |

Use `../../templates/docs/system-design.md` and `../../templates/docs/ADR.md` as starting points.
See `../../examples/hello-todo-go/docs/architecture/system-design.md`,
`../../examples/hello-todo-go/docs/architecture/tech-stack.md`, and
`../../examples/hello-todo-go/docs/architecture/decisions/0001-go-gin-hexagonal.md` for filled-in examples.

## process

1. **Read all Phase 2 artifacts.** Load `docs/specs/functional-spec.md`, `api-spec.md`, and `data-model.md`. Architecture must be grounded in actual requirements, not preferences.

2. **Choose an architecture pattern.** Select from the patterns documented in `../../code-architectures/`. For most new single-service projects, start with layered or hexagonal. Record the reason in an ADR. Ask the user if they have a constraint (e.g., team familiarity, existing codebase pattern) before committing.

3. **Define service boundaries.** Map each bounded context or major responsibility to a service or module. Draw a simple component diagram in the system-design doc (ASCII or Mermaid). Label each boundary with its ownership and primary data entities.

4. **Select the tech stack.** Choose language, framework, database, cache, and any infrastructure dependencies. For each choice, consult the matching profile under `../../stacks/`. Record rationale and at least one considered alternative in an ADR for every decision that is not obvious.

5. **Define data ownership and flow.** For each data entity from the functional spec, record: which service owns it, how it is persisted, and how other consumers access it.

6. **Identify integration points.** List external systems, third-party APIs, and internal service dependencies. For each, specify: protocol, auth method, and expected failure mode.

7. **Document key tradeoffs.** For every significant constraint or design choice, record what was gained and what was sacrificed. This section is the most valuable part of the system-design doc for future engineers.

8. **Write ADRs for major decisions.** Any decision that is hard to reverse or that a future engineer would reasonably question needs an ADR. Use `../../templates/docs/ADR.md`. Number sequentially (`0001-`, `0002-`, …).

9. **Confirm gate passage.** Gate 4 from `../../workflow/phase-gates.md`: stack choices explicit, service boundaries explicit, major tradeoffs documented, ADRs written where needed.

## templates to reference

- `../../templates/docs/system-design.md` — canonical system design template.
- `../../templates/docs/ADR.md` — canonical ADR template.
- `../../code-architectures/hexagonal.md`, `layered.md`, `clean.md`, `ddd.md` — pattern references.
- `../../stacks/` — per-stack profiles with conventions and defaults.

## quality checks

- `docs/architecture/system-design.md` contains: component diagram, service boundaries, data ownership, integration points, and tradeoffs.
- `docs/architecture/tech-stack.md` lists every runtime dependency with version constraint and rationale.
- At least one ADR exists covering the architecture pattern choice.
- Every external integration is named and its failure mode is acknowledged.
- Phase-gate 4 criteria pass (`../../workflow/phase-gates.md` § Gate 4).

## anti-patterns

- **Picking the stack before requirements are settled.** Stack choices that are made in Phase 0 or 1 pre-empt tradeoff analysis and produce unmotivated decisions.
- **Skipping ADRs for "obvious" choices.** What is obvious to the original author is not obvious six months later or to a new contributor.
- **Drawing architecture diagrams that do not match the actual data flow.** Diagrams must reflect where data lives, not just which services exist.
- **Designing for scale that the requirements do not require.** Architecture should match stated constraints. Over-engineering a single-user tool as a distributed system is a waste and a risk.
- **Leaving integration points undocumented.** Unspecified external calls become the first production incident.
