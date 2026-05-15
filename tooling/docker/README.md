# docker tooling

Multi-stage Dockerfile templates and a dev compose stack for Go, Node.js, and
Python services. The `init-project.sh` script copies the relevant template into
a bootstrapped project's root.

## files

| File | Purpose |
|---|---|
| `Dockerfile.go.template` | Multi-stage Go build: golang:1.23-alpine builder → distroless/static-debian12 runtime |
| `Dockerfile.node.template` | Multi-stage Node build: node:22-alpine builder → node:22-alpine runtime (non-root) |
| `Dockerfile.python.template` | Multi-stage Python build: python:3.12-slim + uv venv builder → python:3.12-slim runtime (non-root) |
| `docker-compose.dev.yml.template` | Dev compose: app + PostgreSQL 17-alpine + Redis 7-alpine |

## adoption

1. Copy the relevant `Dockerfile.<lang>.template` to your project root as `Dockerfile`.
2. Replace `YOUR_ORG/YOUR_REPO` in the `LABEL org.opencontainers.image.source` line.
3. Adjust the `CMD` / `ENTRYPOINT` for your framework and binary name.
4. Copy `docker-compose.dev.yml.template` to `docker-compose.dev.yml` and fill in
   `<APP_NAME>`, `<DB_NAME>`, and `<HOST_PORT>:<CONTAINER_PORT>` placeholders.
5. Add `docker-compose.dev.yml` (and `docker-compose.override.yml`) to `.gitignore.common`
   if you prefer not to commit local port bindings. The template itself stays committed.

## base image versions pinned (2026-05-15)

| Image | Tag |
|---|---|
| Go builder | `golang:1.23-alpine` |
| Go runtime | `gcr.io/distroless/static-debian12:nonroot` |
| Node builder + runtime | `node:22-alpine` |
| Python builder + runtime | `python:3.12-slim` |
| PostgreSQL | `postgres:17-alpine` |
| Redis | `redis:7-alpine` |

Use Dependabot or Renovate to receive patch-version bump PRs automatically.

## security notes

- Go runtime uses `distroless/static-debian12:nonroot`; the image has no shell,
  no package manager, and runs as UID 65532 by default. Switch to `scratch` only
  if you are certain your binary has no CA certificate requirements.
- Node runtime runs as the built-in `node` user (UID 1000).
- Python runtime creates a dedicated `appuser` (non-root) via `adduser`.
- None of the runtime stages include build tools, compilers, or dev dependencies.
