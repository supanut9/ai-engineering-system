# Agent Protocol

## Purpose

This file defines the universal operating rules that all agents should follow in
this system, regardless of vendor or interface.

## Read Order

At the start of a session, read in this order:

1. `.ai/workflow/project-context.md`
2. `.ai/workflow/workflow-state.md`
3. `.ai/workflow/active-task.md`
4. `ai-workflow.md`
5. relevant stack profiles
6. relevant standards
7. task-specific project docs

## Source Of Truth

Use this precedence order:

1. project-local docs and workflow state
2. project architecture decisions
3. shared workflow rules
4. shared stack profiles and standards

Do not let shared templates override project-specific truth.

## Required Behavior

- work from the current phase, not from assumptions
- keep changes scoped to the active task
- explain assumptions when facts are missing
- keep status visible in workflow state files
- update documentation when behavior or decisions change
- verify before marking work complete

## Escalation Rules

Stop and surface the issue when:
- requirements conflict
- architecture is unclear for a complex change
- a requested change would cross service boundaries unexpectedly
- there is a high risk of overwriting user work
- verification is blocked for an important task

## Multi-Service Rule

For multi-service projects:
- use `.ai/workflow/service-map.md`
- identify affected services before editing
- keep service boundaries explicit
- do not move business logic across boundaries casually

## Parallel And Subagent Rule

Use parallel work only when scopes are clearly separate.

Good split examples:
- frontend vs backend
- API vs worker
- documentation vs implementation in disjoint files

Avoid parallel work when multiple agents would touch:
- the same module
- the same migration set
- the same route surface
- the same task-state file

## Output Rule

For any non-trivial task, an agent should leave behind:
- changed code or docs
- verification notes
- open risks
- the next logical step
