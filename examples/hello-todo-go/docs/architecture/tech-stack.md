# tech stack — hello-todo-go

| layer | choice | version | notes |
|---|---|---|---|
| language | Go | 1.23 | latest stable as of 2026-05-15; generics available since 1.18; `log/slog` available since 1.21 |
| http framework | Gin | v1.10.0 | widely used Go web framework; handles routing, JSON binding, and middleware |
| storage | in-memory map | — | `map[string]Todo` guarded by `sync.RWMutex`; no external storage dependency |
| logging | `log/slog` | stdlib (Go 1.21+) | structured logging to stdout; no third-party logging library needed for this example |
| id generation | `crypto/rand` | stdlib | produces opaque ids without an external library; no monotonic guarantee needed for in-memory store |
| http testing | `net/http/httptest` | stdlib | test server and recorder for handler-level tests without starting a real listener |
| unit testing | `testing` | stdlib | standard Go test runner; no third-party assertion library |
| json encoding | `encoding/json` | stdlib | used by Gin for binding and response encoding |
| linting | `gofmt` + `go vet` | stdlib | format and vet enforced in CI; see note below on golangci-lint |
| ci | GitHub Actions | — | see `.github/workflows/ci.yml`; runs `go test ./...` and `go vet ./...` |

---

## notes

### linting

`gofmt` and `go vet` are enforced in CI for v0.1.0. The system's Phase 3 tooling
(`tooling/go/.golangci.yml`) adds `golangci-lint v2.11.4` for stricter static analysis.
That config can be adopted for this example once Phase 3 of the ai-engineering-system
ships.

### no external dependencies at runtime

All imports are from the Go standard library plus Gin. This keeps the dependency surface
minimal and the example focused on architecture rather than library choices.

### future additions (out of scope for v0.1.0)

| capability | candidate | when |
|---|---|---|
| persistent storage | `database/sql` + SQLite or Postgres driver | v0.2.0 |
| metrics | `prometheus/client_golang` | when observability is required |
| distributed tracing | `go.opentelemetry.io/otel` | when tracing is required |
| containerization | `Dockerfile` multi-stage build | when CI deploy is added |
