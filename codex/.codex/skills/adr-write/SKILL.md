---
name: adr-write
description: Use when capturing an architecture or significant technical decision as an Architecture Decision Record (ADR).
---

# adr write

Cross-cutting maintenance skill — applies whenever a non-reversible technical choice is made.
Reference: `../../templates/docs/ADR.md`, `../../workflow/phase-gates.md`.

## when to use

- A non-reversible technical choice is being made: framework selection, persistence layer, integration pattern, deployment topology, authentication mechanism, or inter-service communication style.
- The team is debating two or more approaches and a decision must be recorded to prevent revisiting it without new information.
- A decision was made implicitly and will not be remembered with its rationale in six months.
- A Phase 2 (architecture) gate requires an ADR to be present before implementation begins.

Do not write ADRs for reversible low-stakes choices (variable naming, minor tooling preferences, config tuning).

## what to produce

A new file at:

```
docs/architecture/decisions/NNNN-<kebab-case-summary>.md
```

Numbers are monotonically increasing from `0001`. Check existing files in `docs/architecture/decisions/` to determine the next number.

Status lifecycle: `Proposed` while under review → `Accepted` on merge → `Superseded by MMMM-name` if replaced.

## process

1. **Load the template.** Read `../../templates/docs/ADR.md`. Fill every section; do not delete sections even if sparse.

2. **Set Status and Date.** Status is `Proposed` when first written. Date is today's date in ISO 8601 (`YYYY-MM-DD`).

3. **Write Context.** Describe the forces at play: technical constraints, team capabilities, timeline pressure, external dependencies, and any prior decisions that constrain the option space. Context is factual, not opinionated.

4. **Write Decision.** State the choice in one declarative sentence beginning with "We will …" or "The system uses …". Do not explain why yet — that belongs in Consequences.

5. **Write Consequences.** List outcomes under three sub-categories:
   - **Positive:** benefits gained by this decision.
   - **Negative:** costs, risks, or tradeoffs accepted.
   - **Neutral:** facts that change but are neither clearly good nor bad.
   At least one bullet per sub-category is required.

6. **Write Alternatives Considered.** List 2–4 alternatives that were evaluated. For each, one line: the option name and the reason it was not chosen. Honest "why not" prevents the same debate from recurring.

7. **Link related documents.** Add references to the relevant PRD section, related ADRs (predecessor, sibling, or dependent decisions), and any spike or proof-of-concept docs.

8. **Place the file and open a PR.** The ADR is not accepted until merged. Do not treat a draft ADR as a binding decision.

## templates to reference

- `../../templates/docs/ADR.md` — canonical ADR template.
- `../../examples/hello-todo-go/docs/architecture/decisions/0001-go-gin-hexagonal.md` — filled-in example showing all sections in use.

## quality checks

- Decision statement is declarative, not exploratory ("we will use X" not "we could use X or Y").
- Consequences section has at least one bullet in each of Positive, Negative, and Neutral.
- Alternatives Considered is non-empty with a "why not" for each option.
- No vague consequence claims: avoid "scalable", "modern", "best practice" without supporting evidence.
- Status is set correctly: `Proposed` before merge, `Accepted` after.
- File is numbered correctly and placed in `docs/architecture/decisions/`.

## anti-patterns

- **Writing ADRs after the fact as justification.** An ADR written to justify a done deal skips the alternatives analysis and produces a dishonest record. Write it during the decision, not after.
- **Skipping the Alternatives section.** Without alternatives, the ADR is a memo, not a decision record. The value of an ADR is documenting what was rejected and why.
- **Vague consequences.** "This will scale well" is not a consequence. "Horizontal scaling requires stateless request handling, which eliminates server-side session storage as an option" is a consequence.
- **Using ADRs for trivial decisions.** If the decision can be reversed in under an hour with no downstream impact, it does not need an ADR. Reserve the format for choices that are expensive to undo.
- **Leaving Status as Proposed indefinitely.** An ADR that never gets accepted is noise. Either merge and accept it, or close it as Rejected with a note.
