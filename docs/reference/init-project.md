# init-project.sh

Bootstrap a new project from the AI Engineering System.

## Synopsis

```
./scripts/init-project.sh --name <name> --stack <stack> [options]
```

## Description

`init-project.sh` creates a new project directory populated with stack-appropriate skeleton files, AI workflow documents, adapter files for the chosen agent (Claude Code, Codex, or both), and a git repository with an initial commit.

The script requires **bash 4+**. macOS ships with bash 3.2 by default — install a newer version with `brew install bash`.

Steps performed, in order:

1. Creates the target directory (fails if it already exists and is non-empty).
2. Copies the matching stack skeleton from `templates/skeletons/<stack>/` if present.
3. Renders workflow files from `templates/project-files/` into `.ai/workflow/` with token substitution.
4. Generates `README.md`, `CHANGELOG.md`, `.gitignore`, and `.env.example`.
5. Copies agent adapter files (`claude/`, `codex/`, or both) into the target.
6. Runs `git init` and makes an initial commit (unless `--no-git`).
7. Prints a next-steps banner.

## Options

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--name <name>` | yes | — | Project directory name; also used as the project name inside generated files. A bare positional argument is accepted as an alias for `--name`. |
| `--stack <stack>` | yes | — | Stack template to use. One of: `go-gin-layered`, `go-gin-clean`, `go-gin-hexagonal`, `nestjs-layered`, `nextjs-default`. |
| `--agent <agent>` | no | `claude` | Agent adapter to copy: `claude`, `codex`, or `both`. |
| `--git` | no | on | Initialise a git repository and make the initial commit. |
| `--no-git` | no | — | Skip git initialisation entirely. |
| `--target <path>` | no | `./<name>` | Override the destination directory. Accepts relative or absolute paths. |
| `--help`, `-h` | no | — | Print usage and exit. |

## Examples

```bash
# Minimal — name and stack only; uses defaults (agent=claude, git=on)
./scripts/init-project.sh --name my-api --stack go-gin-hexagonal

# NestJS project with both agent adapters, placed in a specific directory
./scripts/init-project.sh --name my-service --stack nestjs-layered \
  --agent both --target ~/projects/my-service

# Positional name shorthand, skip git init
./scripts/init-project.sh my-app --stack nextjs-default --no-git

# Use Codex only, override target path
./scripts/init-project.sh --name todo-api --stack go-gin-clean \
  --agent codex --target /tmp/todo-api
```

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success — project bootstrapped. |
| `1` | Invalid or missing argument (`--name`, `--stack`, `--agent`). |
| `1` | Target directory already exists and is non-empty. |
| `1` | Unknown flag passed. |
| `1` | Bash version is older than 4. |
