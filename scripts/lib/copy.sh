#!/usr/bin/env bash
# lib/copy.sh — Template rendering and file-copy helpers.
#
# Provides:
#   render_template <src> <dst> [key=value ...]
#     Copies <src> to <dst>, substituting {{KEY}} with value for each
#     key=value pair passed as extra arguments.
#
#   portable_sed_inplace <file> <expression>
#     Runs `sed` in-place in a cross-platform way (macOS vs Linux).
#
# Usage:
#   source "$SCRIPT_DIR/lib/copy.sh"
#   render_template "$src" "$dst" "PROJECT_NAME=myapp" "STACK=go-gin-hexagonal"

[[ -n "${_AES_COPY_SH:-}" ]] && return 0
readonly _AES_COPY_SH=1

# ---------------------------------------------------------------------------
# portable_sed_inplace <file> <expression>
#   On macOS, `sed -i ''` is required; on GNU sed `-i` alone suffices.
#   We use the bak-then-remove pattern to stay compatible with both.
# ---------------------------------------------------------------------------
portable_sed_inplace() {
  local file="$1"
  local expr="$2"
  sed -i.sedbak "${expr}" "${file}"
  rm -f "${file}.sedbak"
}

# ---------------------------------------------------------------------------
# render_template <src> <dst> [KEY=value ...]
#   Copies <src> to <dst> then substitutes each {{KEY}} placeholder.
#   Existing <dst> is overwritten.
# ---------------------------------------------------------------------------
render_template() {
  local src="$1"
  local dst="$2"
  shift 2

  # Ensure destination directory exists.
  local dst_dir
  dst_dir="$(dirname -- "${dst}")"
  mkdir -p "${dst_dir}"

  # Copy source to destination.
  cp -- "${src}" "${dst}"

  # Apply substitutions.
  local pair key value
  for pair in "$@"; do
    key="${pair%%=*}"
    value="${pair#*=}"
    # Escape forward slashes and ampersands in the value for sed.
    local escaped_value
    escaped_value="$(printf '%s\n' "${value}" | sed 's/[\/&]/\\&/g')"
    portable_sed_inplace "${dst}" "s/{{${key}}}/${escaped_value}/g"
  done
}
