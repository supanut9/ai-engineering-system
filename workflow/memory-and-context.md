# memory and context

A practical guide to the three persistence layers in this system and when to use each.

---

## overview

Three persistence layers exist, each with a different lifetime and audience.

| Layer | File location | Lifetime | Audience |
|---|---|---|---|
| Project docs | `docs/` and `.ai/workflow/` in the project repo | Forever (committed) | The team, future contributors, future agents |
| Auto-memory | `~/.claude/projects/<path>/memory/` and `MEMORY.md` | Across sessions, personal | The current human user (or the agent on their behalf) |
| Templates | `templates/` in the system repo | Forever (system-versioned) | All bootstrapped projects |

Each has a clear purpose. Use the wrong one and either the team loses context (project
information put in personal memory) or memory accumulates project-state debt (project state
put in memory instead of docs).

---

## what goes in project docs

Long-lived, team-visible knowledge:

- Phase artifacts under `docs/` — PRD, system-design, ADRs, plans, runbooks.
- Workflow state under `.ai/workflow/{project-context,workflow-state,active-task}.md`.
- Service boundaries, integration contracts, deployment topology.
- Anything a new team member or future agent needs to orient without asking questions.

These files are committed. They are the team's shared brain. When an agent reads project
context at session start (see `workflow/ai-workflow.md`), it reads these files — not memory.

---

## what goes in auto-memory

Cross-session knowledge that is personal to the user (or to the agent on their behalf):

- **User preferences** (`feedback_*.md`) — style rules, working-mode quirks, "always run
  tests before suggesting a deploy."
- **User profile** (`user_*.md`) — role, expertise level, comfort with each part of the stack.
- **Project shortcuts** (`project_*.md`) — "this monorepo is on Vercel except for
  knowledge-api which moved to Railway last quarter." Convenient, not authoritative.
- **Reference pointers** (`reference_*.md`) — Linear project IDs, Grafana dashboard URLs,
  Slack channel names for on-call.

Memory is not versioned with the project. It survives across projects on the same machine.
Treat it as the user's personal notebook, not the source of truth.

---

## what goes in templates

Reusable starting points the system provides at bootstrap:

- `templates/docs/*.md` — section skeletons for each phase artifact (PRD, system-design,
  ADR, plan, runbook, etc.).
- `templates/project-files/*.md` — bootstrapped workflow-state stubs for `.ai/workflow/`.
- `templates/skills/*` — skill-authoring scaffolding (see `skill-authoring-guide.md`).
- `templates/skeletons/*` — runnable starter trees per stack.

Templates are part of the system; they evolve with system versions. Use them once at
bootstrap and adapt the copy in the project repo. Do not symlink them.

---

## how they compose

A typical working session uses all three layers:

1. Auto-memory loads at session start — preferences and project notes from previous sessions
   are available immediately.
2. The agent opens the relevant project doc for the current phase (plan, runbook, ADR).
3. When producing a new artifact, the agent references the appropriate template for structure,
   then writes the result into `docs/`.

When deciding where to record a new fact, ask: *is this for the team or for me?*

- Team fact → `docs/`.
- Personal or session-convenience fact → memory.
- Reusable structure → template (system repo, not project repo).

---

## decision rules

| Situation | Where it goes |
|---|---|
| Architecture decision | `docs/architecture/decisions/NNNN-*.md` (ADR) — not memory |
| Stack choice | ADR (team-visible) |
| A bug you hit and fixed with a non-obvious root cause | Commit message + one line in `docs/maintenance/runbook.md`; memory entry only if the *why* will not be visible elsewhere |
| External system URLs and dashboards the whole team needs | `docs/maintenance/runbook.md` |
| External system URLs only you need cross-project | `reference_*.md` in memory |
| Merge freeze schedule or operational calendar facts | `project_*.md` in memory — temporal context, not architecture |
| Coding style | `standards/coding-standards.md` (system) or per-project `CONTRIBUTING.md` — not memory |
| A teammate's working preference | Nowhere — it is their preference, not yours |

---

## anti-patterns

- **Saving project state in memory because it is faster.** Convenient until you switch
  machines or a colleague needs the same context.
- **Saving personal preferences in `CONTRIBUTING.md`.** Surprising to the team; that file is
  for contributor conventions, not individual working styles.
- **Saving the same fact in both memory and `docs/` and letting them drift.** Pick one
  location. Memory is not authoritative; `docs/` is.
- **Acting on a recalled memory claim without cross-checking the repo.** Memory is a
  convenience index. Verify against the code or docs before acting on a recalled claim.

---

## versioning and drift

- Project docs are versioned with the code (git). History is the audit trail.
- Templates are versioned with the system (`VERSION` at the system repo root).
- Memory has no version stamp. Claude Code tags entries with creation context but does not
  enforce schema. Prune stale entries periodically.
- When templates evolve in a new system version, projects can replay via
  `scripts/sync-agent-files.sh`. Memory does not get rebuilt; treat it as immutable personal
  history unless explicitly pruned.

---

## see also

- `workflow/ai-workflow.md` — full phase definitions and their artifacts
- `workflow/subagent-contract.md` — how subagents get context (briefs, not memory)
- `templates/docs/runbook.md` — where shared operational knowledge lives
- `templates/skills/skill-authoring-guide.md` — how skills consume context
