#!/usr/bin/env bash
# lib/args.sh — Argument-parsing helpers for ai-engineering-system scripts.
#
# Provides:
#   contains_element <needle> <array_element>...  — returns 0 if found
#   require_arg     <flag_name> <value>            — die if value is empty
#   resolve_path    <path>                         — portable realpath fallback
#
# Usage:
#   source "$SCRIPT_DIR/lib/args.sh"

[[ -n "${_AES_ARGS_SH:-}" ]] && return 0
readonly _AES_ARGS_SH=1

# ---------------------------------------------------------------------------
# contains_element <needle> [elements...]
#   Returns 0 if needle is found among the remaining arguments, 1 otherwise.
# ---------------------------------------------------------------------------
contains_element() {
  local needle="$1"; shift
  local element
  for element in "$@"; do
    [[ "${element}" == "${needle}" ]] && return 0
  done
  return 1
}

# ---------------------------------------------------------------------------
# require_arg <flag_name> <value>
#   Calls die() if <value> is empty/unset.
# ---------------------------------------------------------------------------
require_arg() {
  local flag_name="$1"
  local value="$2"
  if [[ -z "${value}" ]]; then
    die "Missing required argument: ${flag_name}"
  fi
}

# ---------------------------------------------------------------------------
# resolve_path <path>
#   Portable absolute-path resolution that works even when <path> does not
#   yet exist (important for --target resolution before mkdir).
#
#   Strategy:
#     1. If the path already exists, try `realpath` (most accurate).
#     2. Otherwise resolve the parent dir via cd, then append the basename.
#     3. If all else fails, prefix with $PWD for relative paths.
# ---------------------------------------------------------------------------
resolve_path() {
  local path="$1"

  # If the path already exists use realpath when available (most accurate).
  if [[ -e "${path}" ]] && command -v realpath >/dev/null 2>&1; then
    realpath -- "${path}"
    return
  fi

  # Pure-bash resolution that handles non-existent targets.
  local dir base
  dir="$(dirname -- "${path}")"
  base="$(basename -- "${path}")"

  # Resolve the parent portion via cd.
  local resolved_dir
  if resolved_dir="$(cd -- "${dir}" 2>/dev/null && pwd)"; then
    printf '%s/%s\n' "${resolved_dir}" "${base}"
  else
    # Parent doesn't exist either — make path absolute relative to CWD.
    if [[ "${path}" = /* ]]; then
      printf '%s\n' "${path}"
    else
      printf '%s/%s\n' "$(pwd)" "${path}"
    fi
  fi
}
