# Go Gin Clean

## Use When

Use this blueprint when:

- the stack is Go
- the default HTTP framework is Gin
- the code architecture is clean architecture
- business logic matters enough to justify stronger boundaries

## Stack

- language: Go
- HTTP framework: Gin
- default database: PostgreSQL

## Code Architecture

- style: clean architecture

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
  domain/
  application/
  ports/
  adapters/
    http/
      handlers/
      middleware/
      routes/
    repository/
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

- `cmd/api/` = application entrypoint and dependency wiring
- `internal/config/` = configuration loading and validation
- `internal/domain/` = core business rules and domain types
- `internal/application/` = use cases and application orchestration
- `internal/ports/` = inward-facing interfaces owned by the core
- `internal/adapters/http/` = Gin edge layer and request or response translation
- `internal/adapters/repository/` = persistence adapters

## Required Workflow Files

- `AGENTS.md` or `CLAUDE.md` depending on tool
- `.ai/workflow/project-context.md`
- `.ai/workflow/workflow-state.md`
- `.ai/workflow/active-task.md`

## Notes

- use Gin only as a delivery adapter
- do not leak Gin or SQL concerns into `domain/` or `application/`
- prefer this blueprint over layered only when the service complexity justifies
  the extra abstraction cost
