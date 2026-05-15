# verify-example.sh

Verify a fully filled-in example project from the AI Engineering System.

## Synopsis

```
./scripts/verify-example.sh [--example <name>]
```

## Description

`verify-example.sh` runs a comprehensive verification pipeline against one of the reference example projects in `examples/`. For the `hello-todo-go` example (Go / Gin / Hexagonal), the pipeline runs:

1. `go mod tidy` — ensures the module graph is clean.
2. `gofmt -l .` — fails if any files are not correctly formatted.
3. `go vet ./...` — static analysis.
4. `go test -race ./...` — full test suite with race detector.
5. `go build -o bin/api ./cmd/api` — verifies the binary compiles.
6. Starts `./bin/api` and waits up to 5 seconds for `GET /healthz` to return `200`.
7. Runs smoke tests against all six API endpoints: `GET /healthz`, `POST /v1/todos`, `GET /v1/todos`, `GET /v1/todos/{id}`, `PATCH /v1/todos/{id}`, `DELETE /v1/todos/{id}`.
8. Cleans up the server process and the `bin/` directory.

The script detects the stack automatically from `go.mod`, `package.json`, or `.ai/workflow/project-context.md`.

The script requires **bash 4+**, **go**, and **curl**.

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--example <name>` | `hello-todo-go` | Name of the example directory under `examples/` to verify. |
| `--help`, `-h` | — | Print usage and exit. |

## Examples

```bash
# Verify the default hello-todo-go example
./scripts/verify-example.sh

# Explicitly name the example
./scripts/verify-example.sh --example hello-todo-go
```

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | All verification steps passed. |
| `1` | Example directory not found. |
| `1` | `gofmt` found unformatted files. |
| `1` | `go test` or `go vet` failed. |
| `1` | Binary failed to build. |
| `1` | Server did not become ready within 5 seconds. |
| `1` | A smoke-test request returned an unexpected status code. |
| `1` | Unknown flag passed. |
| `1` | Bash version is older than 4. |
