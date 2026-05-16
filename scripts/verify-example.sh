#!/usr/bin/env bash
# verify-example.sh — Verify a fully filled-in example from the AI Engineering System.
#
# Requirements:
#   bash 4+  (macOS ships bash 3.2 by default — install via `brew install bash`)
#   go       (required for the hello-todo-go example)
#   curl     (required for the smoke-test step)
#
# Usage:
#   ./scripts/verify-example.sh [--example <name>]
#
# Run with --help for full usage.

# ============================================================
# Bash version gate — must come before any bash 4+ syntax
# ============================================================
if (( BASH_VERSINFO[0] < 4 )); then
  echo "[fatal] bash 4+ is required. macOS ships bash 3.2 by default." >&2
  echo "        Install a newer bash: brew install bash" >&2
  exit 1
fi

set -euo pipefail
IFS=$'\n\t'

# ============================================================
# Locate SCRIPT_DIR and SYSTEM_ROOT
# ============================================================
_resolve_dir() {
  local dir="$1"
  if command -v realpath >/dev/null 2>&1; then
    realpath -- "${dir}"
  else
    cd -- "${dir}" && pwd
  fi
}

SCRIPT_DIR="$(_resolve_dir "$(dirname -- "$0")")"
SYSTEM_ROOT="$(_resolve_dir "${SCRIPT_DIR}/..")"

# ============================================================
# Source helper libraries
# ============================================================
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/log.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/args.sh"

# ============================================================
# Usage
# ============================================================
usage() {
  cat <<EOF
Usage: $(basename -- "$0") [options]

Verify the fully filled-in example project in examples/<name>/.

Options:
  --example <name>  Example to verify (default: hello-todo-go)
  --help, -h        Print this help and exit

Supported examples:
  hello-todo-go                    Go / Gin hexagonal reference project
  hello-todo-nextjs                Next.js / App Router layered reference project
  hello-todo-fastify               Fastify / hexagonal reference project (TypeScript)
  hello-todo-nestjs                NestJS / modules + DI reference project
  hello-todo-react-native-expo     Expo / mobile reference project
  hello-todo-rust                  Rust / Axum hexagonal reference project

Examples:
  $(basename -- "$0")
  $(basename -- "$0") --example hello-todo-go
  $(basename -- "$0") --example hello-todo-nextjs
  $(basename -- "$0") --example hello-todo-fastify
  $(basename -- "$0") --example hello-todo-nestjs
  $(basename -- "$0") --example hello-todo-react-native-expo
  $(basename -- "$0") --example hello-todo-rust
EOF
}

# ============================================================
# Argument parsing
# ============================================================
ARG_EXAMPLE="hello-todo-go"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --example)
      [[ $# -lt 2 ]] && die "--example requires a value"
      ARG_EXAMPLE="$2"; shift 2 ;;
    --help|-h)
      usage; exit 0 ;;
    -*)
      error "Unknown flag: $1"
      usage >&2
      exit 1 ;;
    *)
      error "Unexpected argument: $1"
      usage >&2
      exit 1 ;;
  esac
done

# ============================================================
# Resolve example directory
# ============================================================
EXAMPLE_DIR="${SYSTEM_ROOT}/examples/${ARG_EXAMPLE}"
if [[ ! -d "${EXAMPLE_DIR}" ]]; then
  die "Example directory not found: ${EXAMPLE_DIR}"
fi

# ============================================================
# Detect stack
# ============================================================
detect_stack() {
  local dir="$1"
  local pctx="${dir}/.ai/workflow/project-context.md"

  # Try the project-context.md stack: line first.
  if [[ -f "${pctx}" ]]; then
    local stack_line
    stack_line="$(grep -i '^\-.*language:' "${pctx}" 2>/dev/null | head -1 || true)"
    if [[ "${stack_line}" =~ [Gg]o ]]; then
      echo "go"; return
    fi
  fi

  # File-presence heuristics.
  if [[ -f "${dir}/go.mod" ]]; then
    echo "go"; return
  fi
  if [[ -f "${dir}/Cargo.toml" ]]; then
    echo "rust"; return
  fi
  if [[ -f "${dir}/package.json" ]]; then
    if [[ -f "${dir}/next.config.mjs" || -f "${dir}/next.config.js" ]]; then
      echo "nextjs"; return
    fi
    if [[ -f "${dir}/nest-cli.json" ]]; then
      echo "nestjs"; return
    fi
    # Expo / React Native: app.json + expo dep.
    if [[ -f "${dir}/app.json" ]] && grep -q '"expo"' "${dir}/package.json" 2>/dev/null; then
      echo "react-native"; return
    fi
    # Fastify: look for a fastify dependency in package.json.
    if grep -q '"fastify"' "${dir}/package.json" 2>/dev/null; then
      echo "fastify"; return
    fi
    echo "node"; return
  fi

  echo "unknown"
}

STACK="$(detect_stack "${EXAMPLE_DIR}")"
info "Detected stack: ${STACK}"

# ============================================================
# Track timing
# ============================================================
START_TS="$(date +%s)"

# ============================================================
# Cleanup trap — kills the API process and removes bin/
# Registered before any background process is launched.
# ============================================================
API_PID=""
cleanup() {
  if [[ -n "${API_PID}" ]]; then
    kill "${API_PID}" 2>/dev/null || true
    wait "${API_PID}" 2>/dev/null || true
    API_PID=""
  fi
  rm -rf "${EXAMPLE_DIR:?}/bin"
}
trap cleanup EXIT

# ============================================================
# Verify: Go stack
# ============================================================
verify_go() {
  local dir="$1"

  # --- go mod tidy ---
  info "[1/5] go mod tidy"
  (cd "${dir}" && go mod tidy)

  # --- gofmt ---
  info "[2/5] gofmt -l ."
  local fmt_out
  fmt_out="$(cd "${dir}" && gofmt -l .)"
  if [[ -n "${fmt_out}" ]]; then
    error "gofmt found unformatted files:"
    printf '%s\n' "${fmt_out}" >&2
    die "verify-example: gofmt check failed"
  fi

  # --- go vet ---
  info "[3/5] go vet ./..."
  (cd "${dir}" && go vet ./...)

  # --- go test -race ---
  info "[4/5] go test -race ./..."
  (cd "${dir}" && go test -race ./...)

  # --- go build ---
  info "[5/5] go build -o bin/api ./cmd/api"
  (cd "${dir}" && go build -o bin/api ./cmd/api)

  # --- start server ---
  info "[smoke] Starting ./bin/api"
  (cd "${dir}" && ./bin/api) &
  API_PID="$!"

  # Wait up to 5 s for the server to become ready.
  local port="8080"
  local deadline=5
  local elapsed=0
  local ready=false
  while (( elapsed < deadline )); do
    if curl -sf "http://127.0.0.1:${port}/healthz" >/dev/null 2>&1; then
      ready=true
      break
    fi
    sleep 1
    (( elapsed += 1 ))
  done

  if [[ "${ready}" != "true" ]]; then
    die "verify-example: server did not become ready within ${deadline}s"
  fi
  info "[smoke] Server ready on port ${port}"

  # --- Smoke-test the 6 endpoints ---
  local base="http://127.0.0.1:${port}"

  # 1. GET /healthz
  info "[smoke] GET /healthz"
  curl -sf "${base}/healthz" >/dev/null

  # 2. POST /v1/todos — capture the id for subsequent requests
  info "[smoke] POST /v1/todos"
  local create_resp todo_id
  create_resp="$(curl -sf -X POST "${base}/v1/todos" \
    -H "Content-Type: application/json" \
    -d '{"title":"verify smoke test"}')"
  # Extract the id field portably (no jq dependency).
  todo_id="$(printf '%s' "${create_resp}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)"
  if [[ -z "${todo_id}" ]]; then
    die "verify-example: POST /v1/todos returned no id"
  fi
  info "[smoke] Created todo id=${todo_id}"

  # 3. GET /v1/todos
  info "[smoke] GET /v1/todos"
  curl -sf "${base}/v1/todos" >/dev/null

  # 4. GET /v1/todos/{id}
  info "[smoke] GET /v1/todos/${todo_id}"
  curl -sf "${base}/v1/todos/${todo_id}" >/dev/null

  # 5. PATCH /v1/todos/{id}
  info "[smoke] PATCH /v1/todos/${todo_id}"
  curl -sf -X PATCH "${base}/v1/todos/${todo_id}" \
    -H "Content-Type: application/json" \
    -d '{"completed":true}' >/dev/null

  # 6. DELETE /v1/todos/{id}
  info "[smoke] DELETE /v1/todos/${todo_id}"
  local http_status
  http_status="$(curl -s -o /dev/null -w "%{http_code}" \
    -X DELETE "${base}/v1/todos/${todo_id}")"
  if [[ "${http_status}" != "204" ]]; then
    die "verify-example: DELETE /v1/todos/${todo_id} returned ${http_status}, expected 204"
  fi

  info "[smoke] All 6 endpoints passed"
}

# ============================================================
# Verify: Next.js
# ============================================================
verify_nextjs() {
  local dir="$1"

  # --- npm install ---
  info "[1/5] npm install"
  (cd "${dir}" && npm install --no-audit --no-fund --silent)

  # --- vitest run ---
  info "[2/5] make test (vitest run)"
  (cd "${dir}" && make test)

  # --- eslint . ---
  info "[3/5] make lint (eslint)"
  (cd "${dir}" && make lint)

  # --- next build ---
  info "[4/5] make build (next build)"
  (cd "${dir}" && make build)

  # --- start production server ---
  info "[5/5] starting production server (next start)"
  local port="3100"
  (cd "${dir}" && PORT="${port}" npx --no -- next start --port "${port}" >/dev/null 2>&1) &
  API_PID="$!"

  # Wait up to 15 s for the server to become ready (Next start is slower than Go).
  local deadline=15
  local elapsed=0
  local ready=false
  while (( elapsed < deadline )); do
    if curl -sf "http://127.0.0.1:${port}/healthz" >/dev/null 2>&1; then
      ready=true
      break
    fi
    sleep 1
    (( elapsed += 1 ))
  done

  if [[ "${ready}" != "true" ]]; then
    die "verify-example: server did not become ready within ${deadline}s"
  fi
  info "[smoke] Server ready on port ${port}"

  local base="http://127.0.0.1:${port}"

  # 1. GET /healthz
  info "[smoke] GET /healthz"
  curl -sf "${base}/healthz" >/dev/null

  # 2. POST /api/todos — capture the id for subsequent requests
  info "[smoke] POST /api/todos"
  local create_resp todo_id
  create_resp="$(curl -sf -X POST "${base}/api/todos" \
    -H "Content-Type: application/json" \
    -d '{"title":"verify smoke test"}')"
  todo_id="$(printf '%s' "${create_resp}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)"
  if [[ -z "${todo_id}" ]]; then
    die "verify-example: POST /api/todos returned no id"
  fi
  info "[smoke] Created todo id=${todo_id}"

  # 3. GET /api/todos
  info "[smoke] GET /api/todos"
  curl -sf "${base}/api/todos" >/dev/null

  # 4. PATCH /api/todos/{id}
  info "[smoke] PATCH /api/todos/${todo_id}"
  curl -sf -X PATCH "${base}/api/todos/${todo_id}" \
    -H "Content-Type: application/json" \
    -d '{"completed":true}' >/dev/null

  # 5. DELETE /api/todos/{id}
  info "[smoke] DELETE /api/todos/${todo_id}"
  local http_status
  http_status="$(curl -s -o /dev/null -w "%{http_code}" \
    -X DELETE "${base}/api/todos/${todo_id}")"
  if [[ "${http_status}" != "204" ]]; then
    die "verify-example: DELETE /api/todos/${todo_id} returned ${http_status}, expected 204"
  fi

  info "[smoke] All endpoints passed"
}

# ============================================================
# Verify: Fastify
# ============================================================
verify_fastify() {
  local dir="$1"

  # --- npm install ---
  info "[1/5] npm install"
  (cd "${dir}" && npm install --no-audit --no-fund --silent)

  # --- vitest run ---
  info "[2/5] make test (vitest run)"
  (cd "${dir}" && make test)

  # --- lint ---
  info "[3/5] make lint"
  (cd "${dir}" && make lint)

  # --- build (tsc) ---
  info "[4/5] make build (tsc)"
  (cd "${dir}" && make build)

  # --- start built server on a non-default port to avoid local clashes ---
  info "[5/5] starting built server (node dist/index.js)"
  local port="8181"
  (cd "${dir}" && PORT="${port}" node dist/index.js >/dev/null 2>&1) &
  API_PID="$!"

  local deadline=10
  local elapsed=0
  local ready=false
  while (( elapsed < deadline )); do
    if curl -sf "http://127.0.0.1:${port}/healthz" >/dev/null 2>&1; then
      ready=true
      break
    fi
    sleep 1
    (( elapsed += 1 ))
  done

  if [[ "${ready}" != "true" ]]; then
    die "verify-example: fastify server did not become ready within ${deadline}s"
  fi
  info "[smoke] Server ready on port ${port}"

  local base="http://127.0.0.1:${port}"

  # 1. GET /healthz
  info "[smoke] GET /healthz"
  curl -sf "${base}/healthz" >/dev/null

  # 2. POST /v1/todos
  info "[smoke] POST /v1/todos"
  local create_resp todo_id
  create_resp="$(curl -sf -X POST "${base}/v1/todos" \
    -H "Content-Type: application/json" \
    -d '{"title":"verify smoke test"}')"
  todo_id="$(printf '%s' "${create_resp}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)"
  if [[ -z "${todo_id}" ]]; then
    die "verify-example: POST /v1/todos returned no id"
  fi
  info "[smoke] Created todo id=${todo_id}"

  # 3. GET /v1/todos
  info "[smoke] GET /v1/todos"
  curl -sf "${base}/v1/todos" >/dev/null

  # 4. GET /v1/todos/{id}
  info "[smoke] GET /v1/todos/${todo_id}"
  curl -sf "${base}/v1/todos/${todo_id}" >/dev/null

  # 5. PATCH /v1/todos/{id}
  info "[smoke] PATCH /v1/todos/${todo_id}"
  curl -sf -X PATCH "${base}/v1/todos/${todo_id}" \
    -H "Content-Type: application/json" \
    -d '{"completed":true}' >/dev/null

  # 6. DELETE /v1/todos/{id}
  info "[smoke] DELETE /v1/todos/${todo_id}"
  local http_status
  http_status="$(curl -s -o /dev/null -w "%{http_code}" \
    -X DELETE "${base}/v1/todos/${todo_id}")"
  if [[ "${http_status}" != "204" ]]; then
    die "verify-example: DELETE /v1/todos/${todo_id} returned ${http_status}, expected 204"
  fi

  info "[smoke] All 6 endpoints passed"
}

# ============================================================
# Verify: NestJS
# ============================================================
verify_nestjs() {
  local dir="$1"

  # --- npm install ---
  info "[1/5] npm install"
  (cd "${dir}" && npm install --no-audit --no-fund --silent)

  # --- jest run ---
  info "[2/5] make test (jest)"
  (cd "${dir}" && make test)

  # --- lint (tsc --noEmit in current NestJS examples) ---
  info "[3/5] make lint"
  (cd "${dir}" && make lint)

  # --- build (nest build) ---
  info "[4/5] make build (nest build)"
  (cd "${dir}" && make build)

  # --- start built server on a non-default port to avoid clashes ---
  info "[5/5] starting built server (node dist/main)"
  local port="3181"
  (cd "${dir}" && PORT="${port}" node dist/main >/dev/null 2>&1) &
  API_PID="$!"

  local deadline=15
  local elapsed=0
  local ready=false
  while (( elapsed < deadline )); do
    if curl -sf "http://127.0.0.1:${port}/healthz" >/dev/null 2>&1; then
      ready=true
      break
    fi
    sleep 1
    (( elapsed += 1 ))
  done

  if [[ "${ready}" != "true" ]]; then
    die "verify-example: nestjs server did not become ready within ${deadline}s"
  fi
  info "[smoke] Server ready on port ${port}"

  local base="http://127.0.0.1:${port}"

  info "[smoke] GET /healthz"
  curl -sf "${base}/healthz" >/dev/null

  info "[smoke] POST /v1/todos"
  local create_resp todo_id
  create_resp="$(curl -sf -X POST "${base}/v1/todos" \
    -H "Content-Type: application/json" \
    -d '{"title":"verify smoke test"}')"
  todo_id="$(printf '%s' "${create_resp}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)"
  if [[ -z "${todo_id}" ]]; then
    die "verify-example: POST /v1/todos returned no id"
  fi
  info "[smoke] Created todo id=${todo_id}"

  info "[smoke] GET /v1/todos"
  curl -sf "${base}/v1/todos" >/dev/null

  info "[smoke] GET /v1/todos/${todo_id}"
  curl -sf "${base}/v1/todos/${todo_id}" >/dev/null

  info "[smoke] PATCH /v1/todos/${todo_id}"
  curl -sf -X PATCH "${base}/v1/todos/${todo_id}" \
    -H "Content-Type: application/json" \
    -d '{"completed":true}' >/dev/null

  info "[smoke] DELETE /v1/todos/${todo_id}"
  local http_status
  http_status="$(curl -s -o /dev/null -w "%{http_code}" \
    -X DELETE "${base}/v1/todos/${todo_id}")"
  if [[ "${http_status}" != "204" ]]; then
    die "verify-example: DELETE /v1/todos/${todo_id} returned ${http_status}, expected 204"
  fi

  info "[smoke] All 6 endpoints passed"
}

# ============================================================
# Verify: React Native / Expo (no HTTP server — make targets only)
# ============================================================
verify_react_native() {
  local dir="$1"

  info "[1/4] npm install"
  (cd "${dir}" && npm install --no-audit --no-fund --silent)

  info "[2/4] make test (jest-expo)"
  (cd "${dir}" && make test)

  info "[3/4] make lint (eslint)"
  (cd "${dir}" && make lint)

  # Expo has no traditional JS build step; typecheck is the closest gate, matching
  # selftest.sh's react-native handling.
  info "[4/4] make typecheck (tsc --noEmit)"
  (cd "${dir}" && make typecheck)

  info "[smoke] No HTTP server to smoke — typecheck is the build-equivalent gate"
}

# ============================================================
# Verify: Rust
# ============================================================
verify_rust() {
  local dir="$1"

  # --- cargo fmt --check ---
  info "[1/5] cargo fmt --all -- --check"
  (cd "${dir}" && cargo fmt --all -- --check)

  # --- cargo clippy -D warnings ---
  info "[2/5] cargo clippy --all-targets --all-features -- -D warnings"
  (cd "${dir}" && cargo clippy --all-targets --all-features -- -D warnings)

  # --- cargo test ---
  info "[3/5] cargo test --all-features"
  (cd "${dir}" && cargo test --all-features)

  # --- cargo build --release ---
  info "[4/5] cargo build --release --bin api"
  (cd "${dir}" && cargo build --release --bin api)

  # --- start server ---
  info "[5/5] Starting ./target/release/api"
  (cd "${dir}" && ./target/release/api) &
  API_PID="$!"

  # Wait up to 5 s for readiness.
  local port="8080"
  local deadline=5
  local elapsed=0
  local ready=false
  while (( elapsed < deadline )); do
    if curl -sf "http://127.0.0.1:${port}/healthz" >/dev/null 2>&1; then
      ready=true
      break
    fi
    sleep 1
    (( elapsed += 1 ))
  done

  if [[ "${ready}" != "true" ]]; then
    die "verify-example: server did not become ready within ${deadline}s"
  fi
  info "[smoke] Server ready on port ${port}"

  # --- Smoke-test the 6 endpoints ---
  local base="http://127.0.0.1:${port}"

  # 1. GET /healthz
  info "[smoke] GET /healthz"
  curl -sf "${base}/healthz" >/dev/null

  # 2. POST /v1/todos
  info "[smoke] POST /v1/todos"
  local create_resp todo_id
  create_resp="$(curl -sf -X POST "${base}/v1/todos" \
    -H "Content-Type: application/json" \
    -d '{"title":"verify smoke test"}')"
  todo_id="$(printf '%s' "${create_resp}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)"
  if [[ -z "${todo_id}" ]]; then
    die "verify-example: POST /v1/todos returned no id"
  fi
  info "[smoke] Created todo id=${todo_id}"

  # 3. GET /v1/todos
  info "[smoke] GET /v1/todos"
  curl -sf "${base}/v1/todos" >/dev/null

  # 4. GET /v1/todos/{id}
  info "[smoke] GET /v1/todos/${todo_id}"
  curl -sf "${base}/v1/todos/${todo_id}" >/dev/null

  # 5. PATCH /v1/todos/{id}
  info "[smoke] PATCH /v1/todos/${todo_id}"
  curl -sf -X PATCH "${base}/v1/todos/${todo_id}" \
    -H "Content-Type: application/json" \
    -d '{"completed":true}' >/dev/null

  # 6. DELETE /v1/todos/{id}
  info "[smoke] DELETE /v1/todos/${todo_id}"
  local http_status
  http_status="$(curl -s -o /dev/null -w "%{http_code}" \
    -X DELETE "${base}/v1/todos/${todo_id}")"
  if [[ "${http_status}" != "204" ]]; then
    die "verify-example: DELETE /v1/todos/${todo_id} returned ${http_status}, expected 204"
  fi

  info "[smoke] All 6 endpoints passed"
}

# ============================================================
# Verify: Node (generic — placeholder)
# ============================================================
verify_node() {
  local dir="$1"
  warn "verify-example: generic 'node' stack smoke checks are not yet implemented."
  warn "  Directory: ${dir}"
  warn "  Skipping."
}

# ============================================================
# Dispatch
# ============================================================
case "${STACK}" in
  go)
    verify_go "${EXAMPLE_DIR}" ;;
  rust)
    verify_rust "${EXAMPLE_DIR}" ;;
  nextjs)
    verify_nextjs "${EXAMPLE_DIR}" ;;
  fastify)
    verify_fastify "${EXAMPLE_DIR}" ;;
  nestjs)
    verify_nestjs "${EXAMPLE_DIR}" ;;
  react-native)
    verify_react_native "${EXAMPLE_DIR}" ;;
  node)
    verify_node "${EXAMPLE_DIR}" ;;
  *)
    die "verify-example: unrecognised stack '${STACK}' for example '${ARG_EXAMPLE}'" ;;
esac

# ============================================================
# Print summary
# ============================================================
END_TS="$(date +%s)"
DURATION=$(( END_TS - START_TS ))

# Print a green summary when stdout is a TTY.
if [[ -t 1 ]] && command -v tput >/dev/null 2>&1 && (( "$(tput colors 2>/dev/null || echo 0)" >= 8 )); then
  _green="$(tput setaf 2)"
  _reset="$(tput sgr0)"
else
  _green=""
  _reset=""
fi

printf '\n%sverify-example: %s OK (%ds)%s\n' \
  "${_green}" "${ARG_EXAMPLE}" "${DURATION}" "${_reset}"
