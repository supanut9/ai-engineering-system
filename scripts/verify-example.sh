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
  hello-todo-go     Go / Gin hexagonal reference project

Examples:
  $(basename -- "$0")
  $(basename -- "$0") --example hello-todo-go
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
  if [[ -f "${dir}/package.json" ]]; then
    if [[ -f "${dir}/next.config.mjs" || -f "${dir}/next.config.js" ]]; then
      echo "nextjs"; return
    fi
    if [[ -f "${dir}/nest-cli.json" ]]; then
      echo "nestjs"; return
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
# Verify: Node / Next / Nest (placeholder — only hello-todo-go in scope)
# ============================================================
verify_node() {
  local dir="$1"
  warn "verify-example: stack 'node/nextjs/nestjs' smoke checks are not yet"
  warn "  implemented (only hello-todo-go / go is in scope for this version)."
  warn "  Directory: ${dir}"
  warn "  Skipping."
}

# ============================================================
# Dispatch
# ============================================================
case "${STACK}" in
  go)
    verify_go "${EXAMPLE_DIR}" ;;
  nextjs|nestjs|node)
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
