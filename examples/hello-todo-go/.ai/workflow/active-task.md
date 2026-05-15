# active task

## goal

TODO-009 — add Makefile, CI, runbook

Complete the final task of milestone v0.1.0: write the Makefile, GitHub Actions CI
workflow, runbook, known-issues doc, and CHANGELOG entry. Polish all phase docs for
consistency. Update workflow state to reflect milestone complete.

## status

`completed`

## affected services

- hello-todo-go (the whole example)

## affected files

- `Makefile`
- `.github/workflows/ci.yml`
- `docs/maintenance/runbook.md`
- `docs/maintenance/known-issues.md`
- `CHANGELOG.md`
- `.ai/workflow/workflow-state.md`
- `.ai/workflow/active-task.md` (this file)

## acceptance criteria

- `make setup && make test` passes from a clean clone
- `make lint` exits zero on correctly formatted code
- CI workflow runs green on the main branch
- runbook covers: start, stop, change port, read logs, restart
- known-issues documents the in-memory storage limitation and links to `milestones.md`
  parking-lot section
- `CHANGELOG.md` has a `## [0.1.0] — 2026-05-15` entry listing all six endpoints
- `workflow-state.md` current phase is Phase 8: Maintenance

## verification plan

- run `make setup && make test && make lint` locally
- push to main branch; confirm CI workflow passes
- read runbook and verify all commands are accurate

## notes

- Makefile targets: `setup`, `run`, `test`, `test-race`, `test-integration`, `lint`, `build`
- CI uses `actions/setup-go@v5` with Go 1.23 and caches the module cache
- `gofmt -l .` in the lint target prints files with formatting issues; exit non-zero if any
- known-issues cross-links to the parking-lot section in `docs/plan/milestones.md`
- all nine tasks (TODO-001 through TODO-009) are now complete

## next

Milestone v0.1.0 complete. Transition to Phase 8 maintenance. Update
`.ai/workflow/workflow-state.md`. Consider v0.2.0 with persistent storage (parking-lot
item in `docs/plan/milestones.md`).
