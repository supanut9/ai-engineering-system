# Task Lifecycle

## Purpose

This file defines the standard task progression used during implementation.

## Statuses

- `todo`
- `in_progress`
- `blocked`
- `done`

## Lifecycle

### 1. Select Task

Choose one task from `docs/plan/tasks.md` that is ready under the phase gates.

### 2. Confirm Scope

Record:
- goal
- affected services
- likely affected files
- acceptance criteria
- verification plan

### 3. Implement

- read relevant code and docs
- make the smallest viable change
- avoid unrelated edits

### 4. Verify

- run relevant tests and checks
- compare result against acceptance criteria
- note what remains unverified

### 5. Update State

Update:
- `.ai/workflow/active-task.md`
- `.ai/workflow/workflow-state.md`
- relevant docs if behavior or decisions changed

### 6. Close Or Escalate

Mark `done` only if the task satisfies acceptance criteria.

Otherwise:
- leave it `blocked` or `in_progress`
- record the blocker explicitly
