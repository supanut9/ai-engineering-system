# cookbook

The cookbook is the task-oriented layer of this documentation. Reference docs (under `docs/reference/`) answer "what does X mean?" — the cookbook answers "how do I do X right now?"

Each recipe is a self-contained walkthrough with exact commands, expected output, and a verification step. Recipes assume you have already read the [quickstart](quickstart.md).

## recipes

| Recipe | Description |
|--------|-------------|
| [bootstrap-go-hexagonal](cookbook/bootstrap-go-hexagonal.md) | Run `init-project.sh`, confirm `make test` is green, and understand every generated file in a Go-Gin-Hexagonal skeleton. |
| [add-an-adr](cookbook/add-an-adr.md) | Write your first Architecture Decision Record using the ADR template and commit it with a Conventional Commits message. |
| [write-a-plan-file](cookbook/write-a-plan-file.md) | Decide when a feature needs a `<feature>-plan.md` at the repo root, draft it in Claude Code plan mode, and lock decisions before implementation starts. |
| [upgrade-system-version](cookbook/upgrade-system-version.md) | Check your project's current system version, compare against upstream, run `sync-agent-files.sh`, and confirm with `doctor.sh`. |
| [add-a-custom-claude-skill](cookbook/add-a-custom-claude-skill.md) | Author a new SKILL.md from the template and wire it into a bootstrapped project's `.claude/skills/` directory. |
| [run-the-hello-todo-example](cookbook/run-the-hello-todo-example.md) | Set up and run the reference example locally; walk through each Phase 0–8 artifact directory to understand the full workflow shape. |
| [bootstrap-a-fastapi-service](cookbook/bootstrap-a-fastapi-service.md) | Bootstrap a FastAPI service with the `--stack fastapi-layered` profile, confirm all four quality gates (pytest, ruff, mypy, uvicorn), and understand the generated layout. |
| [split-work-into-parallel-lanes](cookbook/split-work-into-parallel-lanes.md) | Apply the parallel-lanes-and-waves pattern from `workflow/subagent-contract.md` to decompose a real feature across multiple Claude Code subagent calls. |
| [drive-the-workflow](cookbook/drive-the-workflow.md) | Use the `workflow-runner` meta-skill to detect the current phase, check its gate, and delegate to the right phase-specific skill on any bootstrapped project. |
| [use-the-npm-wrapper](cookbook/use-the-npm-wrapper.md) | Bootstrap a project via `npm create ai-engineering-system@latest` instead of cloning the system repo. Covers the wrapper's system-resolution rules and env vars. |

## contributing recipes

Recipes live under `docs/cookbook/`. Each page must include the six standard sections: **goal**, **prerequisites**, **steps**, **verification**, **common issues**, and **see also**. Target length is 60–140 lines.

Use lowercase ATX headings (`## goal`, not `## Goal`). No emojis. Commands go in shell fences.

When a recipe references a template, workflow doc, or script, link with a relative path from the recipe file (e.g., `../../workflow/ai-workflow.md`).

See [contributing](contributing.md) for the full contribution process and commit-message conventions. The workflow doc at [ai-workflow](workflow/ai-workflow.md) explains the underlying 8-phase model that most recipes operate within.
