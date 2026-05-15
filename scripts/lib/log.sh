#!/usr/bin/env bash
# lib/log.sh — Logging helpers for ai-engineering-system scripts.
#
# Provides: info, warn, error, die
# Colors are emitted only when stdout/stderr is a TTY (tput guarded).
#
# Usage:
#   source "$SCRIPT_DIR/lib/log.sh"
#   info  "Something succeeded"
#   warn  "Something looks off"
#   error "Something failed"
#   die   "Fatal: reason"   # prints to stderr then exits 1

# Guard against double-sourcing.
[[ -n "${_AES_LOG_SH:-}" ]] && return 0
readonly _AES_LOG_SH=1

# ---------------------------------------------------------------------------
# Color setup (only when the descriptor is a real TTY)
# ---------------------------------------------------------------------------
_log_color_reset=""
_log_color_cyan=""
_log_color_yellow=""
_log_color_red=""
_log_color_bold_red=""

if [[ -t 2 ]] && command -v tput >/dev/null 2>&1; then
  _ncolors=$(tput colors 2>/dev/null || echo 0)
  if (( _ncolors >= 8 )); then
    _log_color_reset=$(tput sgr0)
    _log_color_cyan=$(tput setaf 6)
    _log_color_yellow=$(tput setaf 3)
    _log_color_red=$(tput setaf 1)
    _log_color_bold_red=$(tput bold)$(tput setaf 1)
  fi
fi

# ---------------------------------------------------------------------------
# Public functions
# ---------------------------------------------------------------------------

# info <message> — informational line to stderr
info() {
  printf '%s[info]%s  %s\n' \
    "${_log_color_cyan}" "${_log_color_reset}" "$*" >&2
}

# warn <message> — warning line to stderr
warn() {
  printf '%s[warn]%s  %s\n' \
    "${_log_color_yellow}" "${_log_color_reset}" "$*" >&2
}

# error <message> — error line to stderr (does NOT exit)
error() {
  printf '%s[error]%s %s\n' \
    "${_log_color_red}" "${_log_color_reset}" "$*" >&2
}

# die <message> [exit_code] — print fatal error and exit
die() {
  local msg="${1:-fatal error}"
  local code="${2:-1}"
  printf '%s[fatal]%s %s\n' \
    "${_log_color_bold_red}" "${_log_color_reset}" "${msg}" >&2
  exit "${code}"
}
