# AI Engineering System

Reusable AI software delivery system.

## Quickstart

Bootstrap a new project from this system:

```bash
./scripts/init-project.sh --name my-app --stack go-gin-hexagonal --agent claude
cd my-app && make setup && make test
```

Available stacks: `go-gin-layered`, `go-gin-clean`, `go-gin-hexagonal`, `nestjs-layered`, `nextjs-default`.

See [`examples/hello-todo-go/`](examples/hello-todo-go/) for a fully filled-in reference project that walks every workflow phase end-to-end.

Run `./scripts/verify-example.sh` to verify the reference example, or `./scripts/selftest.sh` to bootstrap and verify every stack template at once.

Status:
- core workflow files in place
- stack profiles and standards still need expansion
- stack-specific project templates now live under `project-templates/`

Purpose:
- keep reusable workflow rules separate from project truth
- support multiple agents through thin adapter files
- describe project starts as lightweight blueprints instead of heavy scaffolds

## Layout

- `workflow/`
  Cross-agent workflow rules and gates.
- `stacks/`
  Stack-specific guidance such as Go, NestJS, and Next.js.
- `standards/`
  Shared engineering standards.
- `templates/`
  Reusable doc, workflow-file, and agent-file snippets.
- `project-files/`
  Baseline repository file standards such as `README.md`, `CHANGELOG.md`, and
  `CONTRIBUTING.md`.
- `project-templates/`
  Stack and architecture blueprints written as markdown:
  - `go/go-gin-layered.md`
  - `go/go-gin-clean.md`
  - `go/go-gin-hexagonal.md`
  - `nestjs/nestjs-layered.md`
  - `nextjs/nextjs-default.md`
- `codex/`
  Codex-specific files arranged exactly as they should appear in a real project
  root.
- `claude/`
  Claude Code-specific files arranged exactly as they should appear in a real
  project root.

## Template Model

Project templates are markdown blueprints, not runnable starter folders.

Each blueprint should describe:

- when to use it
- selected stack
- selected code architecture
- bootstrap command
- folder structure
- folder responsibilities
- required workflow files
- important notes and constraints

This keeps templates easier to read, easier for AI to load selectively, and
easier to maintain as framework defaults change.

## Codex formats

This repo keeps Codex official files under `codex/` because
`ai-engineering-system` is a source library, not an active Codex project root.

Inside that adapter subtree, the layout matches the real Codex on-disk
locations:

- custom agents live in `.codex/agents/*.toml`
- repo skills live in `.agents/skills/<skill-name>/SKILL.md`

When bootstrapping a real project, copy the contents of
`codex/` into that project's root so Codex can discover
them.

Those formats are Codex-specific. Other agent systems such as Claude Code and
Gemini CLI use different file names and discovery rules.

## Claude formats

This repo keeps Claude Code official files under
`claude/` because `ai-engineering-system` is a source
library, not an active Claude project root.

Inside that adapter subtree, the layout matches the real Claude Code on-disk
locations:

- project instructions live in `CLAUDE.md`
- skills live in `.claude/skills/<skill-name>/SKILL.md`
- custom subagents live in `.claude/agents/*.md`
- hooks and related project configuration live in `.claude/settings.json`

When bootstrapping a real project, copy the contents of
`claude/` into that project's root so Claude Code can
discover them.
