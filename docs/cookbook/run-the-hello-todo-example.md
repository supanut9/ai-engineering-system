# run the hello-todo-go reference example

## goal

By the end of this recipe you will have the `hello-todo-go` reference service running locally, its smoke tests passing, and a clear understanding of which file in which directory corresponds to which workflow phase.

## prerequisites

- **Go 1.21+** — [go.dev/dl](https://go.dev/dl/).
- **make** — pre-installed on macOS and Linux.
- **curl** — pre-installed on macOS and Linux.
- The AI Engineering System repo cloned locally. The example lives at `examples/hello-todo-go/`.

## steps

**1. Enter the example directory.**

```bash
cd examples/hello-todo-go
```

**2. Install dependencies.**

```bash
make setup
```

This runs `go mod tidy`. Expected output: no errors. A `go.sum` file is created or updated.

**3. Run the test suite.**

```bash
make test
```

Expected output:

```
go test ./...
ok  	github.com/your-org/hello-todo-go/internal/core/todo	0.003s
ok  	github.com/your-org/hello-todo-go/internal/adapters/inbound/http/handlers	0.004s
```

All tests must pass before proceeding.

**4. Start the server.**

```bash
make run
```

Expected output:

```
[GIN-debug] Listening and serving HTTP on :8080
```

Leave this terminal open.

**5. Verify the health endpoint.**

In a second terminal:

```bash
curl -s localhost:8080/healthz
# {"status":"ok"}
```

**6. Exercise the todo endpoints.**

```bash
# Create a todo
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"buy milk"}' localhost:8080/v1/todos
# {"id":"...","title":"buy milk","done":false}

# List all todos
curl -s localhost:8080/v1/todos
# [{"id":"...","title":"buy milk","done":false}]
```

**7. Run the built-in smoke target (optional).**

Stop the running server first (`Ctrl+C`), then:

```bash
make smoke
```

`make smoke` builds the binary, starts it, curls all six endpoints in sequence, and exits. Exit code 0 means all endpoints responded correctly.

**8. Walk the Phase 0–8 artifact directories.**

Now that the server is verified, work through each phase directory to understand the workflow:

| Phase | Directory | Key files |
|-------|-----------|-----------|
| Phase 0 | `.ai/workflow/` | `project-context.md`, `workflow-state.md` |
| Phase 0–1 | `docs/requirements/` | `project-brief.md`, `prd.md`, `user-stories.md`, `acceptance-criteria.md` |
| Phase 2 | `docs/specs/` | `functional-spec.md`, `api-spec.md`, `data-model.md` |
| Phase 3 | `docs/architecture/` | `system-design.md`, `tech-stack.md`, `decisions/0001-go-gin-hexagonal.md` |
| Phase 4 | `docs/plan/` | `implementation-plan.md`, `milestones.md`, `tasks.md` |
| Phase 5 | `internal/`, `cmd/` | The working Go source code |
| Phase 6 | `docs/tests/` | `test-plan.md`, `manual-test-checklist.md`, `regression-checklist.md` |
| Phase 7 | `docs/release/` | `go-live-checklist.md`, `deployment-plan.md`, `rollback-plan.md` |
| Phase 8 | `docs/maintenance/` | `runbook.md`, `known-issues.md` |

Start with `docs/requirements/project-brief.md` and read forward. Each file was written in phase order; the architecture decisions in Phase 3 will make more sense after reading the PRD in Phase 1.

**9. Run the system-level verification script (from the repo root).**

```bash
cd ../..   # back to ai-engineering-system root
./scripts/verify-example.sh
```

This script runs `go mod tidy`, `gofmt`, `go vet`, `go test -race`, builds the binary, starts the server, and runs smoke tests against all six endpoints.

## verification

```bash
make test     # exit 0
make smoke    # exit 0
curl -s localhost:8080/healthz | grep '"status":"ok"'  # prints the line
```

## common issues

**Port 8080 already in use** — set `PORT=9090 make run` to use a different port. Update your `curl` commands accordingly.

**`go mod tidy` fails with network errors** — the example uses only standard-library-adjacent dependencies. If you are behind a proxy, set `GOPROXY=direct` or configure `GOPATH`. Run `go env GOPATH` to confirm your module cache location.

**`make smoke` exits non-zero after killing the server mid-test** — `make smoke` manages the server lifecycle internally. Do not run a separate `make run` at the same time.

**Phase docs seem disconnected from the code** — that is intentional. Reading them alongside the code shows how the written plan maps to the implemented structure. The ADR at `docs/architecture/decisions/0001-go-gin-hexagonal.md` explains the architecture choices visible in `internal/`.

## see also

- [`bootstrap-go-hexagonal.md`](bootstrap-go-hexagonal.md) — bootstrap your own service using the same stack.
- [`add-an-adr.md`](add-an-adr.md) — the ADR in this example (`decisions/0001-go-gin-hexagonal.md`) shows the expected output.
- `workflow/ai-workflow.md` — the 8-phase model whose artifact structure this example demonstrates.
- `scripts/verify-example.sh` — the automated verification harness for this example.
