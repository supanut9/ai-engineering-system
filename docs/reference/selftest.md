# selftest.sh

Bootstrap and verify every stack template in the AI Engineering System.

## Synopsis

```
./scripts/selftest.sh [--stacks <list>] [--keep]
```

## Description

`selftest.sh` is the system's own integration test harness. For each requested stack, it:

1. Calls `init-project.sh` to bootstrap a fresh project into a temporary directory.
2. Runs `make setup` in the bootstrapped project.
3. Runs `make test`.
4. Runs `make lint`.
5. Runs `make build` (or `go build ./cmd/api` for Go stacks where the skeleton Makefile has no explicit build target).
6. Prints a results matrix showing `OK`, `FAIL`, or `SKIP` for each step.
7. Cleans up the temporary directory (unless `--keep`).

Stacks are skipped automatically if the required tool (`go`, `node`, or `npm`) is not on `PATH`. When a stack is skipped because it was explicitly requested via `--stacks`, the script exits non-zero.

The script requires **bash 4+**. Go stacks additionally require `go`; NestJS and Next.js stacks require `node` and `npm`.

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--stacks <list>` | all stacks | Comma-separated subset of stacks to test. Available: `go-gin-layered`, `go-gin-clean`, `go-gin-hexagonal`, `nestjs-layered`, `nextjs-default`. |
| `--keep` | off | Keep the temporary output directories after the run. Useful for debugging a failed step. |
| `--help`, `-h` | — | Print usage and exit. |

## Examples

```bash
# Run all stacks (requires go + node/npm on PATH)
./scripts/selftest.sh

# Test only the Go hexagonal stack
./scripts/selftest.sh --stacks go-gin-hexagonal

# Test two Go stacks and keep temp dirs for inspection
./scripts/selftest.sh --stacks go-gin-layered,go-gin-clean --keep

# Test NestJS only
./scripts/selftest.sh --stacks nestjs-layered
```

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | All tested stacks passed (skipped stacks from `--stacks all` are allowed). |
| `1` | One or more stacks failed. |
| `1` | An explicitly requested stack was skipped due to a missing tool. |
| `1` | Unknown flag or unknown stack name passed. |
| `1` | Bash version is older than 4. |
