# Go Gin Hexa

## Use When

Use this blueprint when:

- the stack is Go
- the default HTTP framework is Gin
- the code architecture is hexagonal architecture
- the service has multiple integrations or clear inbound and outbound adapter
  boundaries

## Stack

- language: Go
- HTTP framework: Gin
- default database: PostgreSQL

## Code Architecture

- style: hexagonal architecture

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
  core/
  ports/
    inbound/
    outbound/
  adapters/
    inbound/
      http/
        handlers/
        middleware/
        routes/
    outbound/
      postgres/
      redis/
      external-api/
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
- `internal/core/` = protected business core
- `internal/ports/inbound/` = contracts for incoming application interactions
- `internal/ports/outbound/` = contracts for external dependencies
- `internal/adapters/inbound/http/` = Gin adapter layer
- `internal/adapters/outbound/*` = concrete infrastructure adapters

## Required Workflow Files

- `AGENTS.md` or `CLAUDE.md` depending on tool
- `.ai/workflow/project-context.md`
- `.ai/workflow/workflow-state.md`
- `.ai/workflow/active-task.md`

## Notes

- use Gin only as an inbound adapter
- define ports only where they protect real boundaries
- prefer this over `go-gin-clean` only when explicit inbound and outbound
  adapter modeling is useful enough to justify the extra structure
