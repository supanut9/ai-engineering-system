#!/usr/bin/env bash
# sync-agent-files.sh — Re-sync AI adapter files into an existing bootstrapped project.
#
# Run from inside the project directory, or pass --target <path>.
#
# Requirements:
#   bash 4+  (macOS ships bash 3.2 by default — install via `brew install bash`)
#
# Usage:
#   ./scripts/sync-agent-files.sh [options]
#
# Options:
#   --target <path>   Path to the bootstrapped project  (default: current directory)
#   --agent  <agent>  claude | codex | both              (auto-detected if omitted)
#   --yes             Skip confirmation prompt before overwriting
#   --check           Diff-only mode: exit non-zero if drift exists (no writes)
#   --help, -h        Print this help and exit

# ============================================================
# Bash version gate
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
# (SC1091 suppressed: SCRIPT_DIR is resolved at runtime; paths are correct)
# ============================================================
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/log.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/args.sh"

# ============================================================
# Read system version
# ============================================================
VERSION_FILE="${SYSTEM_ROOT}/VERSION"
if [[ -f "${VERSION_FILE}" ]]; then
  SYSTEM_VERSION="$(tr -d '[:space:]' < "${VERSION_FILE}")"
else
  SYSTEM_VERSION="unknown"
fi

# ============================================================
# Usage
# ============================================================
usage() {
  cat <<EOF
Usage: $(basename -- "$0") [options]

Re-sync AI adapter files from the AI Engineering System v${SYSTEM_VERSION}
into an existing bootstrapped project.

Options:
  --target <path>   Path to the bootstrapped project (default: current directory)
  --agent  <agent>  claude | codex | both  (auto-detected from project-context.md)
  --yes             Skip confirmation prompt before overwriting
  --check           Diff-only: exit non-zero if drift detected, do not write files
  --help, -h        Print this help and exit
EOF
}

# ============================================================
# Argument parsing
# ============================================================
ARG_TARGET=""
ARG_AGENT=""
ARG_YES=false
ARG_CHECK=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      [[ $# -lt 2 ]] && die "--target requires a value"
      ARG_TARGET="$2"; shift 2 ;;
    --agent)
      [[ $# -lt 2 ]] && die "--agent requires a value"
      ARG_AGENT="$2"; shift 2 ;;
    --yes|-y)
      ARG_YES=true; shift ;;
    --check)
      ARG_CHECK=true; shift ;;
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
# Resolve target directory
# ============================================================
if [[ -z "${ARG_TARGET}" ]]; then
  TARGET_DIR="$(pwd)"
else
  TARGET_DIR="$(resolve_path "${ARG_TARGET}")"
fi

if [[ ! -d "${TARGET_DIR}" ]]; then
  die "Target directory does not exist: ${TARGET_DIR}"
fi

# ============================================================
# Auto-detect agent from project-context.md if not specified
# ============================================================
_detect_agent() {
  local has_claude=false
  local has_codex=false
  [[ -f "${TARGET_DIR}/CLAUDE.md" || -d "${TARGET_DIR}/.claude" ]] && has_claude=true
  [[ -d "${TARGET_DIR}/.codex" ]] && has_codex=true

  if [[ "${has_claude}" == "true" && "${has_codex}" == "true" ]]; then
    echo "both"
  elif [[ "${has_claude}" == "true" ]]; then
    echo "claude"
  elif [[ "${has_codex}" == "true" ]]; then
    echo "codex"
  else
    echo "claude"   # safe default
  fi
}

if [[ -z "${ARG_AGENT}" ]]; then
  ARG_AGENT="$(_detect_agent)"
  info "Auto-detected agent adapter: ${ARG_AGENT}"
fi

VALID_AGENTS=("claude" "codex" "both")
if ! contains_element "${ARG_AGENT}" "${VALID_AGENTS[@]}"; then
  die "Invalid --agent '${ARG_AGENT}'. Valid values: ${VALID_AGENTS[*]}"
fi

# ============================================================
# Helper: diff a source tree against a destination
# Returns 0 if identical, 1 if drift exists
# ============================================================
_diff_tree() {
  local src_dir="$1"
  local dst_dir="$2"
  local label="$3"
  local has_drift=0

  if [[ ! -d "${src_dir}" ]]; then
    warn "Source not found, cannot diff: ${src_dir}"
    return 0
  fi

  if [[ ! -d "${dst_dir}" ]]; then
    printf '[drift] %s: destination missing (%s)\n' "${label}" "${dst_dir}"
    return 1
  fi

  # Walk source files, diff each against destination.
  local rel_path
  while IFS= read -r src_file; do
    rel_path="${src_file#"${src_dir}/"}"
    dst_file="${dst_dir}/${rel_path}"
    if [[ ! -f "${dst_file}" ]]; then
      printf '[drift] %s: missing in project: %s\n' "${label}" "${rel_path}"
      has_drift=1
    elif ! diff -q "${src_file}" "${dst_file}" >/dev/null 2>&1; then
      printf '[drift] %s: differs: %s\n' "${label}" "${rel_path}"
      diff --unified=3 "${dst_file}" "${src_file}" 2>/dev/null || true
      has_drift=1
    fi
  done < <(find "${src_dir}" -type f | sort)

  return "${has_drift}"
}

_diff_file() {
  local src="$1"
  local dst="$2"
  local label="$3"

  if [[ ! -f "${src}" ]]; then
    warn "Source not found, cannot diff: ${src}"
    return 0
  fi

  if [[ ! -f "${dst}" ]]; then
    printf '[drift] %s: missing in project: %s\n' "${label}" "${dst}"
    return 1
  fi

  if ! diff -q "${src}" "${dst}" >/dev/null 2>&1; then
    printf '[drift] %s: differs\n' "${label}"
    diff --unified=3 "${dst}" "${src}" 2>/dev/null || true
    return 1
  fi

  return 0
}

# ============================================================
# Check mode — diff and exit
# ============================================================
if [[ "${ARG_CHECK}" == "true" ]]; then
  info "Running drift check (--check mode, no files written)"
  DRIFT=0

  case "${ARG_AGENT}" in
    claude|both)
      _diff_file \
        "${SYSTEM_ROOT}/claude/CLAUDE.md" \
        "${TARGET_DIR}/CLAUDE.md" \
        "CLAUDE.md" || DRIFT=1
      _diff_tree \
        "${SYSTEM_ROOT}/claude/.claude" \
        "${TARGET_DIR}/.claude" \
        ".claude/" || DRIFT=1
      ;;
  esac
  case "${ARG_AGENT}" in
    codex|both)
      _diff_tree \
        "${SYSTEM_ROOT}/codex/.codex" \
        "${TARGET_DIR}/.codex" \
        ".codex/" || DRIFT=1
      ;;
  esac

  if [[ "${DRIFT}" -eq 0 ]]; then
    info "No drift detected — project adapter files match system v${SYSTEM_VERSION}"
    exit 0
  else
    warn "Drift detected — run sync-agent-files.sh (without --check) to update"
    exit 1
  fi
fi

# ============================================================
# Interactive / --yes sync mode
# ============================================================
info "Syncing agent files from system v${SYSTEM_VERSION} into: ${TARGET_DIR}"
info "Agent: ${ARG_AGENT}"

_confirm() {
  local prompt="$1"
  if [[ "${ARG_YES}" == "true" ]]; then
    return 0
  fi
  printf '%s [y/N] ' "${prompt}"
  local answer
  read -r answer
  [[ "${answer}" =~ ^[Yy]$ ]]
}

if ! _confirm "This will overwrite adapter files in '${TARGET_DIR}'. Continue?"; then
  info "Aborted."
  exit 0
fi

CLAUDE_SRC="${SYSTEM_ROOT}/claude"
CODEX_SRC="${SYSTEM_ROOT}/codex"

_sync_claude() {
  info "  Syncing Claude adapter"
  if [[ -f "${CLAUDE_SRC}/CLAUDE.md" ]]; then
    cp "${CLAUDE_SRC}/CLAUDE.md" "${TARGET_DIR}/CLAUDE.md"
    info "    updated: CLAUDE.md"
  else
    warn "    claude/CLAUDE.md not found in system — skipping"
  fi

  if [[ -d "${CLAUDE_SRC}/.claude" ]]; then
    mkdir -p "${TARGET_DIR}/.claude"
    cp -R "${CLAUDE_SRC}/.claude/." "${TARGET_DIR}/.claude/"
    info "    updated: .claude/"
  else
    warn "    claude/.claude/ not found in system — skipping"
  fi
}

_sync_codex() {
  info "  Syncing Codex adapter"
  if [[ -d "${CODEX_SRC}/.codex" ]]; then
    mkdir -p "${TARGET_DIR}/.codex"
    cp -R "${CODEX_SRC}/.codex/." "${TARGET_DIR}/.codex/"
    info "    updated: .codex/"
  else
    warn "    codex/.codex/ not found in system — skipping"
  fi
}

case "${ARG_AGENT}" in
  claude) _sync_claude ;;
  codex)  _sync_codex ;;
  both)   _sync_claude; _sync_codex ;;
esac

info "Sync complete — adapter files are now at system v${SYSTEM_VERSION}"
