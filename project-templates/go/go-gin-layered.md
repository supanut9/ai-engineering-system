# Go Gin Layered

## Use When

Use this blueprint when:

- the stack is Go
- the default HTTP framework is Gin
- the code architecture is layered
- the service is mostly standard API and workflow logic

## Stack

- language: Go
- HTTP framework: Gin
- default database: PostgreSQL

## Code Architecture

- style: layered architecture

## Bootstrap

Initial setup:

```bash
go mod init example.com/my-service
go get github.com/gin-gonic/gin
go mod tidy
```

## Folder Structure

```text
cmd/
  api/
internal/
  config/
  http/
    handlers/
    middleware/
    routes/
  service/
  repository/
  model/
pkg/
tests/
docs/
  requirements/
  specs/
  architecture/
  plan/
  tests/
  release/
  maintenance/
.ai/
  workflow/
```

## Folder Responsibilities

- `cmd/api/` = application entrypoint and startup wiring
- `internal/config/` = configuration loading and validation
- `internal/http/` = Gin routing, handlers, request and response mapping
- `internal/service/` = application and business flow logic
- `internal/repository/` = persistence access
- `internal/model/` = service-facing data structures and domain types
- `pkg/` = only reusable packages with clear external value
- `tests/` = integration or end-to-end test support

## Required Workflow Files

- `AGENTS.md` or `CLAUDE.md` depending on tool
- `.ai/workflow/project-context.md`
- `.ai/workflow/workflow-state.md`
- `.ai/workflow/active-task.md`

## Notes

- keep Gin at the HTTP edge only
- keep handlers thin
- keep business logic in `service/`
- choose this over clean architecture when the service is straightforward enough
  that stronger abstraction would slow delivery without clear payoff
