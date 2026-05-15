# hello-todo-go

A minimal, single-user todo-list HTTP API built with Go and Gin, structured with hexagonal architecture. It serves as the canonical filled-in reference project for the ai-engineering-system workflow: every phase from project intake (Phase 0) through maintenance documentation (Phase 8) is represented here.

## Quickstart

```bash
make setup   # go mod tidy
make test    # go test ./...
make run     # starts the server on :8080

# In a second terminal:
curl -s localhost:8080/healthz
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"buy milk"}' localhost:8080/v1/todos
curl -s localhost:8080/v1/todos
```

Environment variable `PORT` overrides the default port `8080`.

## Endpoints

| Method | Path            | Description          |
|--------|-----------------|----------------------|
| GET    | /healthz        | Health check         |
| POST   | /v1/todos       | Create a todo        |
| GET    | /v1/todos       | List all todos       |
| GET    | /v1/todos/:id   | Get a single todo    |
| PATCH  | /v1/todos/:id   | Partial update       |
| DELETE | /v1/todos/:id   | Delete a todo        |

## Project layout

```
cmd/api/                                   — composition root (main.go)
internal/
  core/todo/                               — domain entity, service, repository interface
  ports/
    inbound/                               — TodoService interface + input/output DTOs
    outbound/                              — re-exports of the repository contract
  adapters/
    inbound/http/handlers/                 — Gin HTTP handlers
    inbound/http/routes/                   — route wiring
    outbound/memory/                       — in-memory repository adapter
docs/
  requirements/                            — Phase 0–1: project brief, PRD, user stories
  specs/                                   — Phase 2: functional spec, API spec, data model
  architecture/                            — Phase 3: system design, tech stack, ADRs
  plan/                                    — Phase 4: implementation plan, milestones
  tests/                                   — Phase 6: test plan, checklists
  release/                                 — Phase 7: go-live checklist, deployment, rollback
  maintenance/                             — Phase 8: runbook, known issues
```

## Makefile targets

| Target  | Description                                      |
|---------|--------------------------------------------------|
| setup   | `go mod tidy`                                    |
| run     | `go run ./cmd/api`                               |
| test    | `go test ./...`                                  |
| lint    | `gofmt -l .` + `go vet ./...`                    |
| fmt     | `gofmt -w .`                                     |
| build   | produces `bin/api`                               |
| smoke   | builds the binary and curls each endpoint        |

## Full workflow docs

See `docs/` for the complete Phase 0–8 artifacts. Start with `docs/requirements/project-brief.md` to understand the product context, then follow the phases in order.

This example was bootstrapped from ai-engineering-system v0.0.1 and serves as the canonical filled-in reference.
