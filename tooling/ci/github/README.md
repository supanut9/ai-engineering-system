# ci/github — workflow templates

Reusable GitHub Actions workflow templates. Copy the relevant file into your
project's `.github/workflows/` directory and customise as needed. Each template
is self-contained and ready to use without modification for the common case.

## which template to copy

| Stack | Workflow file | Copy to |
|---|---|---|
| Go | `go-ci.yml` | `.github/workflows/ci.yml` |
| Node.js / TypeScript | `node-ci.yml` | `.github/workflows/ci.yml` |
| Python (FastAPI / Django / Flask) | `python-ci.yml` | `.github/workflows/ci.yml` |
| Any stack (release automation) | `release-please.yml` | `.github/workflows/release-please.yml` |
| Any stack (docs site) | `docs.yml` | `.github/workflows/docs.yml` |

## action versions pinned (2026-05-15)

| Action | Version |
|---|---|
| `actions/checkout` | `v4` |
| `actions/setup-go` | `v5` |
| `actions/setup-node` | `v5` |
| `actions/setup-python` | `v5` |
| `golangci/golangci-lint-action` | `v6` |
| `googleapis/release-please-action` | `v4` |

Enable Dependabot or Renovate on your repository to keep these versions current.

## workflow summaries

**go-ci.yml** — checkout → setup-go 1.23.x → mod download → mod verify → go vet →
gofmt check → golangci-lint v2.11.4 → go test -race → go build.
Requires a `.golangci.yml` at the project root (copy from `tooling/go/`).

**node-ci.yml** — checkout → setup-node 22.x → npm ci → npm run lint →
npm run typecheck → npm test → npm run build.
For `pnpm` or `yarn`, change the `cache` key and install command accordingly.

**python-ci.yml** — checkout → setup-python 3.12 → install uv →
uv pip install -e .[dev] → ruff check → ruff format --check → mypy → pytest.
Requires a `pyproject.toml` with a `dev` optional-dependencies group.

**release-please.yml** — defaults to `release-type: simple` with a `VERSION` file.
Switch to `go`, `node`, or `python` to have release-please manage the native version
file. See inline comments for all alternatives.

**docs.yml** — builds mkdocs-material on every PR; deploys to `gh-pages` on push to
`main`. Requires `mkdocs.yml` at the project root.
