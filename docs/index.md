# AI Engineering System

Reusable AI software delivery system — workflow, standards, stacks, and bootstrap scripts for teams building with AI agents.

## Quickstart

Bootstrap a new project in three commands:

```bash
git clone https://github.com/supanut9/ai-engineering-system
cd ai-engineering-system
./scripts/init-project.sh --name my-app --stack go-gin-hexagonal --agent claude
cd my-app && make setup && make test
```

Available stacks: `go-gin-layered`, `go-gin-clean`, `go-gin-hexagonal`, `nestjs-layered`, `nextjs-default`.

See the [Quickstart](quickstart.md) page for a step-by-step walkthrough.

## What's in the system

| Section | What you get |
|---------|-------------|
| [Workflow](workflow/ai-workflow.md) | 8-phase AI delivery workflow, agent protocol, phase gates, subagent contract |
| [Standards](standards/api-standards.md) | API, coding, database, git, logging, security, and testing standards |
| [Stacks](stacks/go.md) | Stack profiles for Go, NestJS, Next.js, PostgreSQL, Redis, Docker |
| [Architectures](code-architectures/hexagonal-architecture.md) | Hexagonal, clean, DDD, and layered architecture references |
| [Project templates](project-templates/go/go-gin-hexagonal.md) | Markdown blueprints per stack and architecture combination |
| [Adapters](claude/CLAUDE.md) | Ready-to-copy Claude Code and Codex adapter files |
| [Reference](reference/init-project.md) | CLI reference for all scripts |
| [Cookbook](cookbook.md) | Common recipes (work in progress) |

## Layout

```
ai-engineering-system/
  workflow/       Cross-agent workflow rules and gates
  stacks/         Stack-specific guidance (Go, NestJS, Next.js, …)
  standards/      Shared engineering standards
  code-architectures/  Architecture reference docs
  project-templates/   Markdown blueprints per stack + architecture
  project-files/  Baseline repository file standards
  templates/      Reusable doc, workflow-file, and agent-file snippets
  claude/         Claude Code adapter files (copy into your project root)
  codex/          Codex adapter files (copy into your project root)
  scripts/        init-project.sh, sync-agent-files.sh, verify-example.sh, selftest.sh
  examples/       Fully filled-in reference projects
  docs/           This documentation site
```
