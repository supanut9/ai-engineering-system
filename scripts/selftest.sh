#!/usr/bin/env bash
# selftest.sh — Bootstrap and verify every stack template in the AI Engineering System.
#
# Requirements:
#   bash 4+  (macOS ships bash 3.2 by default — install via `brew install bash`)
#   go       (required for go-gin-* stacks)
#   node/npm (required for nestjs-layered and nextjs-default stacks)
#
# Usage:
#   ./scripts/selftest.sh [--stacks <list>] [--keep]
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
# SYSTEM_ROOT is used by init-project.sh (called below) and sourced libs.
SYSTEM_ROOT="$(_resolve_dir "${SCRIPT_DIR}/..")"
export SYSTEM_ROOT

# ============================================================
# Source helper libraries
# ============================================================
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/log.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/args.sh"

# ============================================================
# Constants
# ============================================================
ALL_STACKS=(
  "go-gin-layered"
  "go-gin-clean"
  "go-gin-hexagonal"
  "nestjs-layered"
  "nextjs-default"
  "fastify-hexagonal"
  "fastapi-layered"
  "react-native-expo"
  "rust-axum-hexagonal"
)

NODE_STACKS=("nestjs-layered" "nextjs-default" "fastify-hexagonal" "react-native-expo")
GO_STACKS=("go-gin-layered" "go-gin-clean" "go-gin-hexagonal")
# shellcheck disable=SC2034
PYTHON_STACKS=("fastapi-layered")
RUST_STACKS=("rust-axum-hexagonal")

# ============================================================
# Usage
# ============================================================
usage() {
  local stacks_inline="" s
  for s in "${ALL_STACKS[@]}"; do
    stacks_inline="${stacks_inline:+${stacks_inline}, }${s}"
  done
  cat <<EOF
Usage: $(basename -- "$0") [options]

Bootstrap and verify every stack template from the AI Engineering System.
For each stack, init-project.sh is run into a temp dir; the bootstrapped
project's make setup / make test / make lint / make build targets are then
executed.

Options:
  --stacks <list>  Comma-separated subset of stacks to test (default: all)
                   Available: ${stacks_inline}
  --keep           Keep temp output dirs after the run (useful for debugging)
  --help, -h       Print this help and exit

Examples:
  $(basename -- "$0")
  $(basename -- "$0") --stacks go-gin-hexagonal
  $(basename -- "$0") --stacks go-gin-layered,go-gin-clean --keep
EOF
}

# ============================================================
# Argument parsing
# ============================================================
ARG_STACKS_RAW="all"
ARG_KEEP=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --stacks)
      [[ $# -lt 2 ]] && die "--stacks requires a value"
      ARG_STACKS_RAW="$2"; shift 2 ;;
    --keep)
      ARG_KEEP=true; shift ;;
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
# Resolve requested stacks
# ============================================================
declare -a REQUESTED_STACKS=()
if [[ "${ARG_STACKS_RAW}" == "all" ]]; then
  REQUESTED_STACKS=("${ALL_STACKS[@]}")
else
  IFS=',' read -r -a _raw_list <<< "${ARG_STACKS_RAW}"
  for _s in "${_raw_list[@]}"; do
    _s="${_s// /}"  # strip spaces
    if ! contains_element "${_s}" "${ALL_STACKS[@]}"; then
      _sv=""; for _v in "${ALL_STACKS[@]}"; do _sv="${_sv:+${_sv}, }${_v}"; done
      die "Unknown stack '${_s}'. Valid values: ${_sv}"
    fi
    REQUESTED_STACKS+=("${_s}")
  done
fi

# ============================================================
# Temp directory + cleanup trap
# ============================================================
TMP_ROOT="$(mktemp -d /tmp/aes-selftest.XXXXXX)"

# shellcheck disable=SC2329  # cleanup is invoked via trap EXIT, not directly
cleanup() {
  if [[ "${ARG_KEEP}" == "true" ]]; then
    info "selftest: --keep set; leaving temp dir: ${TMP_ROOT}"
  else
    rm -rf "${TMP_ROOT}"
  fi
}
trap cleanup EXIT

info "selftest: temp root = ${TMP_ROOT}"

# ============================================================
# Tool availability checks
# ============================================================
HAS_GO=false
HAS_NODE=false
HAS_NPM=false
HAS_PYTHON=false
HAS_CARGO=false

command -v go      >/dev/null 2>&1 && HAS_GO=true
command -v node    >/dev/null 2>&1 && HAS_NODE=true
command -v npm     >/dev/null 2>&1 && HAS_NPM=true
command -v python3 >/dev/null 2>&1 && HAS_PYTHON=true
command -v cargo   >/dev/null 2>&1 && HAS_CARGO=true

# ============================================================
# Result tracking
# ============================================================
# Associative arrays: results_<step>[stack] = "OK" | "FAIL" | "SKIP" | "-"
declare -A results_setup
declare -A results_test
declare -A results_lint
declare -A results_build

OVERALL_PASS=true
EXPLICITLY_SKIPPED=false  # set to true when an explicitly requested stack is skipped

# ============================================================
# Helper: run a single make step, record result
# ============================================================
# run_step <stack> <step_name> <array_ref> <cmd...>
# Because bash 4 doesn't support passing arrays by reference portably,
# we use a global variable _CURRENT_STACK and a helper that writes into
# the right associative array directly.
_CURRENT_STACK=""

_record() {
  local step="$1" value="$2"
  case "${step}" in
    setup) results_setup["${_CURRENT_STACK}"]="${value}" ;;
    test)  results_test["${_CURRENT_STACK}"]="${value}" ;;
    lint)  results_lint["${_CURRENT_STACK}"]="${value}" ;;
    build) results_build["${_CURRENT_STACK}"]="${value}" ;;
  esac
}

_run_step() {
  local step="$1"; shift
  local step_dir="$1"; shift
  # remaining args are the command

  info "  [${step}] running: $*"
  if (cd "${step_dir}" && "$@"); then
    _record "${step}" "OK"
    return 0
  else
    _record "${step}" "FAIL"
    OVERALL_PASS=false
    return 1
  fi
}

# Mark all four steps for a stack with a given value (SKIP or -).
_mark_all() {
  local stack="$1" val="$2"
  results_setup["${stack}"]="${val}"
  results_test["${stack}"]="${val}"
  results_lint["${stack}"]="${val}"
  results_build["${stack}"]="${val}"
}

# ============================================================
# Test a single stack
# ============================================================
test_stack() {
  local stack="$1"
  _CURRENT_STACK="${stack}"

  local is_go=false is_node=false is_python=false is_rust=false
  if contains_element "${stack}" "${GO_STACKS[@]}"; then
    is_go=true
  fi
  if contains_element "${stack}" "${NODE_STACKS[@]}"; then
    is_node=true
  fi
  if contains_element "${stack}" "${PYTHON_STACKS[@]}"; then
    is_python=true
  fi
  if contains_element "${stack}" "${RUST_STACKS[@]}"; then
    is_rust=true
  fi

  # --- Tool availability check ---
  if [[ "${is_go}" == "true" ]] && [[ "${HAS_GO}" == "false" ]]; then
    warn "selftest: 'go' not found on PATH — skipping ${stack}"
    _mark_all "${stack}" "SKIP"
    if [[ "${ARG_STACKS_RAW}" != "all" ]]; then
      EXPLICITLY_SKIPPED=true
    fi
    return 0
  fi
  if [[ "${is_node}" == "true" ]] && { [[ "${HAS_NODE}" == "false" ]] || [[ "${HAS_NPM}" == "false" ]]; }; then
    warn "selftest: 'node' or 'npm' not found on PATH — skipping ${stack}"
    _mark_all "${stack}" "SKIP"
    if [[ "${ARG_STACKS_RAW}" != "all" ]]; then
      EXPLICITLY_SKIPPED=true
    fi
    return 0
  fi
  if [[ "${is_python}" == "true" ]] && [[ "${HAS_PYTHON}" == "false" ]]; then
    warn "selftest: 'python3' not found on PATH — skipping ${stack}"
    _mark_all "${stack}" "SKIP"
    if [[ "${ARG_STACKS_RAW}" != "all" ]]; then
      EXPLICITLY_SKIPPED=true
    fi
    return 0
  fi
  if [[ "${is_rust}" == "true" ]] && [[ "${HAS_CARGO}" == "false" ]]; then
    warn "selftest: 'cargo' not found on PATH — skipping ${stack}"
    _mark_all "${stack}" "SKIP"
    if [[ "${ARG_STACKS_RAW}" != "all" ]]; then
      EXPLICITLY_SKIPPED=true
    fi
    return 0
  fi

  if [[ "${is_node}" == "true" ]]; then
    info ""
    info "NOTE: ${stack} requires npm install and will be slow (pulling real packages)."
    info ""
  fi
  if [[ "${is_python}" == "true" ]]; then
    info ""
    info "NOTE: ${stack} creates a venv and installs deps. May be slow."
    info ""
  fi

  local target_dir="${TMP_ROOT}/${stack}"

  # --- init-project.sh ---
  info "selftest: bootstrapping ${stack} -> ${target_dir}"
  if ! "${SCRIPT_DIR}/init-project.sh" \
      --name "selftest-${stack}" \
      --stack "${stack}" \
      --agent claude \
      --target "${target_dir}" \
      --no-git; then
    error "selftest: init-project.sh failed for ${stack}"
    _mark_all "${stack}" "FAIL"
    OVERALL_PASS=false
    return 1
  fi

  # --- make setup ---
  if ! _run_step setup "${target_dir}" make setup; then
    # If setup fails, mark remaining steps as not attempted.
    results_test["${stack}"]="FAIL"
    results_lint["${stack}"]="FAIL"
    results_build["${stack}"]="FAIL"
    return 1
  fi

  # --- make test ---
  if [[ "${is_go}" == "true" || "${is_node}" == "true" || "${is_python}" == "true" || "${is_rust}" == "true" ]]; then
    _run_step test "${target_dir}" make test || true
  fi

  # --- make lint ---
  if [[ "${is_go}" == "true" || "${is_node}" == "true" || "${is_python}" == "true" || "${is_rust}" == "true" ]]; then
    _run_step lint "${target_dir}" make lint || true
  fi

  # --- build ---
  # Skeletons vary in what `build` means and whether a `build` target exists in the
  # Makefile. We branch by stack family.
  if [[ "${is_go}" == "true" ]]; then
    # Go skeletons: no build target — invoke `go build` directly so the integration is
    # well-defined regardless of skeleton Makefile evolution.
    local mod_name
    mod_name="$(grep '^module ' "${target_dir}/go.mod" | awk '{print $2}' | head -1)"
    info "  [build] go build ./cmd/api  (module: ${mod_name})"
    if (cd "${target_dir}" && go build -o bin/selftest-api ./cmd/api); then
      results_build["${stack}"]="OK"
    else
      results_build["${stack}"]="FAIL"
      OVERALL_PASS=false
    fi
  elif [[ "${is_node}" == "true" ]]; then
    case "${stack}" in
      nestjs-*|nextjs-*)
        # Both have `make build` wired to nest build / next build.
        _run_step build "${target_dir}" make build || true ;;
      fastify-*)
        # Fastify skeleton Makefile doesn't define build; use the npm script directly.
        info "  [build] npm run build (tsc)"
        if (cd "${target_dir}" && npm run --silent build); then
          results_build["${stack}"]="OK"
        else
          results_build["${stack}"]="FAIL"
          OVERALL_PASS=false
        fi ;;
      react-native-*)
        # Expo: no traditional build in the JS-only sense; typecheck is the closest gate.
        info "  [build] npm run typecheck (Expo: no JS build step)"
        if (cd "${target_dir}" && npm run --silent typecheck); then
          results_build["${stack}"]="OK"
        else
          results_build["${stack}"]="FAIL"
          OVERALL_PASS=false
        fi ;;
      *)
        # Best-effort fallback.
        _run_step build "${target_dir}" make build || true ;;
    esac
  elif [[ "${is_python}" == "true" ]]; then
    # Python: build target equivalent is the typecheck step.
    info "  [build] make typecheck (mypy strict)"
    if (cd "${target_dir}" && make typecheck); then
      results_build["${stack}"]="OK"
    else
      results_build["${stack}"]="FAIL"
      OVERALL_PASS=false
    fi
  elif [[ "${is_rust}" == "true" ]]; then
    info "  [build] cargo build --release --bin api"
    if (cd "${target_dir}" && cargo build --release --bin api); then
      results_build["${stack}"]="OK"
    else
      results_build["${stack}"]="FAIL"
      OVERALL_PASS=false
    fi
  fi
}

# ============================================================
# Main loop
# ============================================================
info "selftest: running ${#REQUESTED_STACKS[@]} stack(s): ${REQUESTED_STACKS[*]}"

for stack in "${REQUESTED_STACKS[@]}"; do
  info ""
  info "========================================"
  info "Stack: ${stack}"
  info "========================================"
  test_stack "${stack}"
done

# ============================================================
# Results matrix
# ============================================================
echo ""
echo "Stack                | Setup | Test  | Lint  | Build"
echo "---------------------|-------|-------|-------|------"

for stack in "${REQUESTED_STACKS[@]}"; do
  printf '%-21s| %-6s| %-6s| %-6s| %s\n' \
    "${stack}" \
    "${results_setup[${stack}]:-  -  }" \
    "${results_test[${stack}]:-  -  }" \
    "${results_lint[${stack}]:-  -  }" \
    "${results_build[${stack}]:-  -  }"
done

echo ""

# ============================================================
# Final exit
# ============================================================
if [[ "${EXPLICITLY_SKIPPED}" == "true" ]]; then
  error "selftest: one or more explicitly requested stacks were skipped (missing tool)"
  exit 1
fi

if [[ "${OVERALL_PASS}" == "true" ]]; then
  info "selftest: all stacks passed"
  exit 0
else
  error "selftest: one or more stacks failed — see output above"
  exit 1
fi
