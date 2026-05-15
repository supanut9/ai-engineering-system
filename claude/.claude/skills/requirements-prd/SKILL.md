---
name: requirements-prd
description: Use when turning a project brief into product requirements, user stories, and acceptance criteria for implementation planning.
---

# requirements prd

Phase 1 of the AI Engineering System workflow (v0.0.1).
Reference: `../../workflow/ai-workflow.md`, `../../workflow/phase-gates.md`.

## when to use

- `docs/requirements/project-brief.md` and `.ai/workflow/project-context.md` exist (Phase 0 is complete).
- A user says "write the PRD", "turn the brief into requirements", or "define user stories for …".
- The project has a brief but no testable requirements or acceptance criteria.

## what to produce

| Artifact | Path |
|---|---|
| Product requirements document | `docs/requirements/prd.md` |
| User stories | `docs/requirements/user-stories.md` |
| Acceptance criteria | `docs/requirements/acceptance-criteria.md` |

Use `../../templates/docs/PRD.md` as the starting point.
See `../../examples/hello-todo-go/docs/requirements/prd.md`,
`../../examples/hello-todo-go/docs/requirements/user-stories.md`, and
`../../examples/hello-todo-go/docs/requirements/acceptance-criteria.md` for filled-in examples.

## process

1. **Read the project brief.** Load `docs/requirements/project-brief.md` and `.ai/workflow/project-context.md`. Do not proceed if either is missing — run `project-intake` first.

2. **Draft goals and non-goals.** Copy the outcome and non-goals from the brief into the PRD verbatim, then refine for precision. Each goal must be testable.

3. **Enumerate features.** List every feature required to satisfy the success measures. For each feature write: feature name, one-sentence description, priority (must / should / could), and the user type it serves.

4. **Write user stories.** Format: "As a [user type], I want [capability] so that [outcome]." One story per discrete user-facing action. Group by feature. Ask the user to confirm priority if the brief is ambiguous.

5. **Write acceptance criteria.** For every user story, write at least one given/when/then criterion. Criteria must be verifiable without subjective judgment. Do not write criteria the team cannot test.

6. **Identify edge cases.** For each feature, list at least one abnormal input, boundary condition, or failure path. These feed directly into the functional spec and test plan.

7. **Record open questions.** If a requirement cannot be finalized without external input, record it in a dedicated "open questions" section. Do not invent answers.

8. **Validate completeness.** Each planned feature must appear in all three files: PRD, user stories, and acceptance criteria. Cross-check before marking the phase done.

9. **Confirm gate passage.** Gate 2 from `../../workflow/phase-gates.md`: core features listed, non-goals listed, acceptance criteria exist, important edge cases known.

## templates to reference

- `../../templates/docs/PRD.md` — canonical PRD template.

## quality checks

- Every feature in the PRD has at least one user story.
- Every user story has at least one given/when/then acceptance criterion.
- Non-goals are explicitly listed (not just absent from the feature list).
- Edge cases section is non-empty.
- Phase-gate 2 criteria pass (`../../workflow/phase-gates.md` § Gate 2).

## anti-patterns

- **Writing requirements as implementation instructions.** "The system should store X in a Postgres table" is not a requirement — "the system should persist X across sessions" is.
- **Skipping non-goals.** Silent scope is scope. Non-goals must be stated.
- **Acceptance criteria that reference internal state.** Criteria must describe externally observable behavior that a tester can verify.
- **Combining multiple behaviors into a single story.** Each story should be completable in one focused implementation task.
- **Proceeding to functional spec with open questions unresolved.** Functional spec cannot define behavior for a requirement that has not been decided.
