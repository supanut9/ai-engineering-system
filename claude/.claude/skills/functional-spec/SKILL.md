---
name: functional-spec
description: Use when converting requirements into implementable feature behavior, screens, states, validation rules, and API-facing contracts.
---

# functional spec

Phase 2 of the AI Engineering System workflow (v0.0.1).
Reference: `../../workflow/ai-workflow.md`, `../../workflow/phase-gates.md`.

## when to use

- Phase 1 artifacts exist: `docs/requirements/prd.md`, `user-stories.md`, `acceptance-criteria.md`.
- A user says "write the functional spec", "define the API", or "describe the screens and flows".
- Requirements are settled but the implementation team cannot build without guessing behavior.

## what to produce

| Artifact | Path |
|---|---|
| Functional specification | `docs/specs/functional-spec.md` |
| API specification | `docs/specs/api-spec.md` |
| Data model | `docs/specs/data-model.md` |
| Screens and flows (when UI exists) | `docs/specs/screens.md` |

Use `../../templates/docs/functional-spec.md` as the starting point.
See `../../examples/hello-todo-go/docs/specs/functional-spec.md`,
`../../examples/hello-todo-go/docs/specs/api-spec.md`, and
`../../examples/hello-todo-go/docs/specs/data-model.md` for filled-in examples.

## process

1. **Load requirements.** Read all three files under `docs/requirements/`. Do not invent behavior that is not grounded in a requirement or explicitly agreed with the user.

2. **Map each requirement to a behavior.** For every user story, write: the triggering action, the expected system response, and the observable result. Cover the happy path first, then the error paths.

3. **Define validation rules.** For every input field or API parameter, specify: data type, allowed range or format, nullability, and the error response when validation fails. Use exact HTTP status codes for API errors.

4. **Write API contracts.** For each endpoint: method, path, request body schema, response body schema, status codes, and auth requirement. Ask the user which API standard the project follows (REST, GraphQL, gRPC); default to REST if not specified.

5. **Define the data model.** List each entity, its fields (name, type, constraint), and its relationships. Use a simple table format. Do not prescribe physical storage (that belongs in architecture-design).

6. **Document screens and flows (UI projects only).** For each screen: name, purpose, entry points, UI state transitions, empty state, loading state, error state. If no design exists, write the behavior spec first and note that visuals are TBD.

7. **Specify role and permission behavior.** For every protected action, state which roles are permitted. Do not leave auth behavior implicit.

8. **Record error catalog.** List every error condition the system must handle, its cause, and the response the user or caller receives.

9. **Confirm gate passage.** Gate 3 from `../../workflow/phase-gates.md`: major flows defined, states and errors defined, API and data model impact understood.

## templates to reference

- `../../templates/docs/functional-spec.md` — canonical functional spec template.

## quality checks

- Every user story from Phase 1 maps to at least one flow in the functional spec.
- Every API endpoint has complete request/response schema including error codes.
- Every input field has explicit validation rules.
- Every data entity has defined fields and constraints.
- Role and permission behavior is specified for all protected operations.
- Phase-gate 3 criteria pass (`../../workflow/phase-gates.md` § Gate 3).

## anti-patterns

- **Describing the UI in terms of implementation.** "The frontend will use a modal component" is not a functional spec — "submitting the form shows a confirmation dialog" is.
- **Leaving validation rules as prose generalities.** "The name must be valid" is not a rule. "The name must be 1–100 characters, non-empty after trimming whitespace" is.
- **Omitting error paths.** A spec without error behavior forces implementers to invent behavior at coding time, which produces inconsistent UX.
- **Mixing the data model with schema migration details.** The functional spec defines entities and relationships; physical storage belongs in architecture-design or implementation notes.
- **Skipping the screens file for UI projects.** Unspecified UI state transitions (empty, loading, error) are the most common source of QA failures.
