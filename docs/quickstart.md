# Quickstart

This page walks you through cloning the AI Engineering System, bootstrapping a new project, and understanding the generated output.

## Prerequisites

| Tool | Minimum version | Install |
|------|----------------|---------|
| bash | 4.x | `brew install bash` on macOS |
| git | any recent | system package manager |
| go | 1.21+ | [go.dev/dl](https://go.dev/dl/) (Go stacks only) |
| node / npm | 20+ | [nodejs.org](https://nodejs.org/) (NestJS / Next.js stacks only) |
| make | any | pre-installed on macOS and Linux |

> **macOS note:** macOS ships with bash 3.2. The scripts require bash 4+.
> Run `brew install bash` before proceeding.

## Step 1 — Clone the system

```bash
git clone https://github.com/supanut9/ai-engineering-system
cd ai-engineering-system
```

## Step 2 — Bootstrap a project

```bash
./scripts/init-project.sh --name my-api --stack go-gin-hexagonal --agent claude
```

The script accepts these flags:

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--name` | yes | — | Project directory name (also used as the project name) |
| `--stack` | yes | — | One of the five supported stacks (see below) |
| `--agent` | no | `claude` | `claude`, `codex`, or `both` |
| `--git` / `--no-git` | no | `--git` | Initialise a git repo in the target directory |
| `--target` | no | `./<name>` | Override the destination path |

### Available stacks

| Stack | Language | Architecture |
|-------|----------|-------------|
| `go-gin-layered` | Go / Gin | Layered |
| `go-gin-clean` | Go / Gin | Clean |
| `go-gin-hexagonal` | Go / Gin | Hexagonal |
| `nestjs-layered` | TypeScript / NestJS | Layered |
| `nextjs-default` | TypeScript / Next.js | Default |

## Step 3 — Enter the project and make it run

```bash
cd my-api
make setup   # installs dependencies, runs any post-init steps
make test    # runs the test suite
```

## What was generated

After `init-project.sh` completes, the project directory contains:

```
my-api/
  README.md               Project readme (pre-filled with quickstart)
  CHANGELOG.md            Keep-a-Changelog stub
  .gitignore              Stack-appropriate ignores
  .env.example            Environment variable template
  CLAUDE.md               Claude Code project instructions (if --agent claude or both)
  .claude/                Claude Code settings, agents, and skills
  .codex/                 Codex config (if --agent codex or both)
  .ai/
    workflow/
      project-context.md  Fill in Phase 0 intake here
      workflow-state.md   Current phase tracker
      active-task.md      Active task details
      service-map.md      Service dependency map
```

## Step 4 — Complete Phase 0 intake

Open `.ai/workflow/project-context.md` and fill in the project context. This is the first step of the 8-phase AI workflow. The workflow phases are documented in [`workflow/ai-workflow.md`](workflow/ai-workflow.md).

## Verifying the reference example

The repo ships with a fully filled-in reference project at `examples/hello-todo-go/` that demonstrates every workflow phase end-to-end. To verify it:

```bash
./scripts/verify-example.sh
```

This runs `go mod tidy`, `gofmt`, `go vet`, `go test -race`, builds the binary, starts the server, and runs smoke tests against all six endpoints.

## Running the full system self-test

To bootstrap and verify every stack template at once:

```bash
./scripts/selftest.sh
```

Run `./scripts/selftest.sh --help` for options including `--stacks` (subset) and `--keep` (preserve temp dirs).

## Keeping your project up to date

When a new system version ships, run this inside your bootstrapped project to pull updated adapter files:

```bash
/path/to/ai-engineering-system/scripts/sync-agent-files.sh
```

Use `--check` to see what has drifted without writing any files:

```bash
/path/to/ai-engineering-system/scripts/sync-agent-files.sh --check
```
