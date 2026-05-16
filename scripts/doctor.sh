#!/usr/bin/env bash
# doctor.sh — Verify that a bootstrapped project follows AI Engineering System conventions.
#
# Requirements:
#   bash 4+  (macOS ships bash 3.2 by default — install via `brew install bash`)
#
# Usage (from the system repo):
#   ./scripts/doctor.sh [--target <path>] [--strict] [--help]
#
# Usage (copied into a downstream project):
#   ./doctor.sh [--target <path>] [--strict] [--help]

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
# Respects symlinks via realpath when available, else pure-bash fallback.
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

Verify that a bootstrapped project follows the AI Engineering System conventions.
Run this inside (or pointed at) a project that was created by init-project.sh.

Options:
  --target <path>  Directory to check  (default: current directory ".")
  --strict         Treat WARN results as FAIL; exit 1 if any WARN
  --help, -h       Print this help and exit

Exit codes:
  0  No FAIL results (and no WARN results under --strict)
  1  One or more FAIL results (or WARN results under --strict)

Example:
  $(basename -- "$0") --target /path/to/my-project
  $(basename -- "$0") --strict
EOF
}

# ============================================================
# Argument parsing
# ============================================================
ARG_TARGET="."
ARG_STRICT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      [[ $# -lt 2 ]] && die "--target requires a value"
      ARG_TARGET="$2"; shift 2 ;;
    --strict)
      ARG_STRICT=true; shift ;;
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

# Resolve target to absolute path.
TARGET="$(resolve_path "${ARG_TARGET}")"

if [[ ! -d "${TARGET}" ]]; then
  die "Target directory does not exist: ${TARGET}"
fi

# ============================================================
# Detect whether we are inside a downstream project or the system repo.
#
# A downstream project:
#   - SYSTEM_ROOT/VERSION exists (we can still reference it from there), AND
#   - TARGET/.ai/workflow/project-context.md contains a system_version key.
#
# If SYSTEM_ROOT/VERSION is not found at all, we skip version-drift checks.
# ============================================================
SYSTEM_VERSION_FILE="${SYSTEM_ROOT}/VERSION"
SYSTEM_VERSION="unknown"

if [[ -f "${SYSTEM_VERSION_FILE}" ]]; then
  SYSTEM_VERSION="$(tr -d '[:space:]' < "${SYSTEM_VERSION_FILE}")"
fi

# ============================================================
# Color setup for TTY output
# (log.sh colors stderr; we need stdout colors for the summary)
# ============================================================
_c_reset=""
_c_green=""
_c_yellow=""
_c_red=""
_c_bold=""

if [[ -t 1 ]] && command -v tput >/dev/null 2>&1; then
  _ncolors=$(tput colors 2>/dev/null || echo 0)
  if (( _ncolors >= 8 )); then
    _c_reset=$(tput sgr0)
    _c_green=$(tput setaf 2)
    _c_yellow=$(tput setaf 3)
    _c_red=$(tput setaf 1)
    _c_bold=$(tput bold)
  fi
fi

# ============================================================
# Result tracking
# ============================================================
PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

# Collect phase-artifact lines for the final summary matrix.
declare -a PHASE_LINES=()

# ============================================================
# Check helpers
# ============================================================
_pass() {
  printf '%s[PASS]%s %s\n' "${_c_green}" "${_c_reset}" "$*"
  (( PASS_COUNT++ )) || true
}

_warn() {
  printf '%s[WARN]%s %s\n' "${_c_yellow}" "${_c_reset}" "$*"
  (( WARN_COUNT++ )) || true
}

_fail() {
  printf '%s[FAIL]%s %s\n' "${_c_red}" "${_c_reset}" "$*"
  (( FAIL_COUNT++ )) || true
}

_infoline() {
  printf '[INFO] %s\n' "$*"
}

# ============================================================
# Resolve project name from target directory basename.
# ============================================================
PROJECT_NAME="$(basename -- "${TARGET}")"

# ============================================================
# Header
# ============================================================
echo ""
printf '%sdoctor%s — checking: %s\n' "${_c_bold}" "${_c_reset}" "${TARGET}"
echo "------------------------------------------------------------"
echo ""

# ============================================================
# CHECK 1: Workflow files
# ============================================================
echo "Check 1: Workflow files"

_required_workflow=(
  ".ai/workflow/project-context.md"
  ".ai/workflow/workflow-state.md"
  ".ai/workflow/active-task.md"
)

for rel in "${_required_workflow[@]}"; do
  full="${TARGET}/${rel}"
  if [[ ! -e "${full}" ]]; then
    _fail "${rel} — missing (required)"
  elif [[ ! -s "${full}" ]]; then
    _warn "${rel} — exists but is empty (zero bytes)"
  else
    _pass "${rel}"
  fi
done

echo ""

# ============================================================
# CHECK 2: Repo health files
# ============================================================
echo "Check 2: Repo health files"

# README.md — FAIL if missing
if [[ ! -e "${TARGET}/README.md" ]]; then
  _fail "README.md — missing (required)"
else
  _pass "README.md"
fi

# CHANGELOG.md — WARN if missing
if [[ ! -e "${TARGET}/CHANGELOG.md" ]]; then
  _warn "CHANGELOG.md — missing (recommended)"
else
  _pass "CHANGELOG.md"
fi

# .gitignore — FAIL if missing
if [[ ! -e "${TARGET}/.gitignore" ]]; then
  _fail ".gitignore — missing (required)"
else
  _pass ".gitignore"
fi

# .env.example — WARN if missing
if [[ ! -e "${TARGET}/.env.example" ]]; then
  _warn ".env.example — missing (recommended; documents required environment variables)"
else
  _pass ".env.example"
fi

echo ""

# ============================================================
# CHECK 3: Adapter files
# ============================================================
echo "Check 3: Adapter files"

HAS_CLAUDE=false
HAS_CODEX=false

if [[ -d "${TARGET}/.claude" ]]; then
  HAS_CLAUDE=true
fi
if [[ -d "${TARGET}/.codex" ]]; then
  HAS_CODEX=true
fi

if [[ "${HAS_CLAUDE}" == "true" ]]; then
  _pass ".claude/ adapter directory exists"

  # .claude/settings.json must be valid JSON
  SETTINGS_JSON="${TARGET}/.claude/settings.json"
  if [[ ! -e "${SETTINGS_JSON}" ]]; then
    _warn ".claude/settings.json — missing (expected alongside .claude/)"
  else
    # Try python3 first, then node
    _json_valid=false
    if command -v python3 >/dev/null 2>&1; then
      if python3 -c "import json, sys; json.load(open('${SETTINGS_JSON}'))" 2>/dev/null; then
        _json_valid=true
      fi
    elif command -v node >/dev/null 2>&1; then
      if node -e "JSON.parse(require('fs').readFileSync('${SETTINGS_JSON}'))" 2>/dev/null; then
        _json_valid=true
      fi
    else
      _warn ".claude/settings.json — cannot validate JSON (no python3 or node available)"
      _json_valid=true  # don't double-penalize
    fi

    if [[ "${_json_valid}" == "true" ]]; then
      _pass ".claude/settings.json — valid JSON"
    else
      _fail ".claude/settings.json — invalid JSON (malformed)"
    fi
  fi

  # CLAUDE.md should exist alongside
  if [[ ! -e "${TARGET}/CLAUDE.md" ]]; then
    _warn "CLAUDE.md — missing (recommended when .claude/ is present)"
  else
    _pass "CLAUDE.md"
  fi
fi

if [[ "${HAS_CODEX}" == "true" ]]; then
  _pass ".codex/ adapter directory exists"

  # .codex/config.toml must be valid TOML (best-effort)
  CODEX_TOML="${TARGET}/.codex/config.toml"
  if [[ ! -e "${CODEX_TOML}" ]]; then
    _warn ".codex/config.toml — missing (expected alongside .codex/)"
  else
    _toml_checked=false
    if command -v python3 >/dev/null 2>&1; then
      # tomllib is in stdlib since Python 3.11; fall back gracefully.
      if python3 -c "import sys; sys.exit(0 if sys.version_info >= (3,11) else 1)" 2>/dev/null; then
        if python3 -c "import tomllib; tomllib.load(open('${CODEX_TOML}','rb'))" 2>/dev/null; then
          _pass ".codex/config.toml — valid TOML"
        else
          _fail ".codex/config.toml — invalid TOML"
        fi
        _toml_checked=true
      fi
    fi
    if [[ "${_toml_checked}" == "false" ]]; then
      _infoline ".codex/config.toml — TOML validation skipped (requires python3 >= 3.11)"
    fi
  fi

  # Count optional .codex/agents/*.toml
  _agent_count=0
  if [[ -d "${TARGET}/.codex/agents" ]]; then
    _agent_count=$(find "${TARGET}/.codex/agents" -maxdepth 1 -name '*.toml' | wc -l | tr -d ' ')
  fi
  _infoline ".codex/agents/*.toml — ${_agent_count} file(s) found"
fi

if [[ "${HAS_CLAUDE}" == "false" ]] && [[ "${HAS_CODEX}" == "false" ]]; then
  _warn "No agent adapter detected (.claude/ and .codex/ both absent)"
fi

echo ""

# ============================================================
# CHECK 4: System version drift
# ============================================================
echo "Check 4: System version drift"

PCTX="${TARGET}/.ai/workflow/project-context.md"

if [[ "${SYSTEM_VERSION}" == "unknown" ]]; then
  _infoline "System VERSION file not discoverable from ${SYSTEM_ROOT} — version drift check skipped"
else
  if [[ ! -f "${PCTX}" ]]; then
    _infoline "project-context.md not present — version drift check skipped"
  else
    # Loose match: look for "system_version" anywhere in the file.
    _project_version=""
    _project_version="$(grep -i 'system_version' "${PCTX}" 2>/dev/null \
      | grep -oE '[0-9]+\.[0-9]+\.[0-9]+([.-][A-Za-z0-9.+-]*)?' \
      | head -1 || true)"

    if [[ -z "${_project_version}" ]]; then
      _warn "system_version not found in project-context.md (run sync-agent-files.sh to update)"
    elif [[ "${_project_version}" != "${SYSTEM_VERSION}" ]]; then
      _warn "system_version mismatch: project=${_project_version} system=${SYSTEM_VERSION} (run sync-agent-files.sh to update)"
    else
      _pass "system_version matches: ${SYSTEM_VERSION}"
    fi
  fi
fi

echo ""

# ============================================================
# CHECK 5: Phase artifacts (advisory — never FAIL)
# ============================================================
echo "Check 5: Phase artifacts (advisory)"

declare -A _phase_evidence=(
  ["Phase 0 — project intake"]="${TARGET}/.ai/workflow/project-context.md"
  ["Phase 1 — PRD"]="${TARGET}/docs/requirements/prd.md"
  ["Phase 2 — functional spec"]="${TARGET}/docs/specs/functional-spec.md"
  ["Phase 3 — system design"]="${TARGET}/docs/architecture/system-design.md"
  ["Phase 4 — implementation plan"]="${TARGET}/docs/plan/implementation-plan.md"
  ["Phase 6 — test plan"]="${TARGET}/docs/tests/test-plan.md"
  ["Phase 7 — go-live checklist"]="${TARGET}/docs/release/go-live-checklist.md"
  ["Phase 8 — runbook"]="${TARGET}/docs/maintenance/runbook.md"
)

# Fixed display order
_phase_keys=(
  "Phase 0 — project intake"
  "Phase 1 — PRD"
  "Phase 2 — functional spec"
  "Phase 3 — system design"
  "Phase 4 — implementation plan"
  "Phase 6 — test plan"
  "Phase 7 — go-live checklist"
  "Phase 8 — runbook"
)

for _key in "${_phase_keys[@]}"; do
  _file="${_phase_evidence[${_key}]}"
  if [[ -e "${_file}" ]]; then
    PHASE_LINES+=("  [x] ${_key}")
  else
    PHASE_LINES+=("  [ ] ${_key}")
  fi
done

# Print phase matrix here too for inline visibility
for _line in "${PHASE_LINES[@]}"; do
  _infoline "${_line#  }"  # strip leading spaces for inline [INFO] prefix
done

echo ""

# ============================================================
# CHECK 6: Tooling configs (per detected stack)
# ============================================================
echo "Check 6: Tooling configs"

_has_go=false
_has_node=false
_has_next=false
_has_nest=false
_has_expo=false
_has_python=false

[[ -f "${TARGET}/go.mod" ]] && _has_go=true

if [[ -f "${TARGET}/package.json" ]]; then
  _has_node=true
  # Check for next.config.* (any extension)
  if ls "${TARGET}"/next.config.* >/dev/null 2>&1; then
    _has_next=true
  fi
  # Check for nest-cli.json
  if [[ -f "${TARGET}/nest-cli.json" ]]; then
    _has_nest=true
  fi
  # Check for expo in dependencies
  if command -v python3 >/dev/null 2>&1; then
    if python3 -c "
import json, sys
try:
    d = json.load(open('${TARGET}/package.json'))
    deps = {**d.get('dependencies',{}), **d.get('devDependencies',{})}
    sys.exit(0 if 'expo' in deps else 1)
except Exception:
    sys.exit(1)
" 2>/dev/null; then
      _has_expo=true
    fi
  elif command -v node >/dev/null 2>&1; then
    if node -e "
const d = JSON.parse(require('fs').readFileSync('${TARGET}/package.json'));
const deps = Object.assign({}, d.dependencies, d.devDependencies);
process.exit('expo' in deps ? 0 : 1);
" 2>/dev/null; then
      _has_expo=true
    fi
  fi
fi

[[ -f "${TARGET}/pyproject.toml" ]] && _has_python=true

# Determine stack label and what to check
if [[ "${_has_go}" == "true" ]]; then
  _infoline "Detected stack: Go"
  # .golangci.yml
  if [[ ! -f "${TARGET}/.golangci.yml" ]]; then
    _warn ".golangci.yml — missing (Go lint config recommended)"
  else
    _pass ".golangci.yml"
  fi
  # Makefile
  if [[ ! -f "${TARGET}/Makefile" ]]; then
    _warn "Makefile — missing (recommended for Go projects)"
  else
    _pass "Makefile"
  fi
fi

if [[ "${_has_node}" == "true" ]]; then
  if [[ "${_has_next}" == "true" ]]; then
    _infoline "Detected stack: Next.js"
  elif [[ "${_has_nest}" == "true" ]]; then
    _infoline "Detected stack: NestJS"
  elif [[ "${_has_expo}" == "true" ]]; then
    _infoline "Detected stack: React Native + Expo"
  else
    _infoline "Detected stack: Node (generic / Fastify)"
  fi

  # ESLint: eslint.config.mjs or .eslintrc.*
  _eslint_found=false
  if [[ -f "${TARGET}/eslint.config.mjs" ]]; then
    _eslint_found=true
  else
    # Check for .eslintrc.* (any extension)
    if ls "${TARGET}"/.eslintrc.* >/dev/null 2>&1; then
      _eslint_found=true
    elif [[ -f "${TARGET}/.eslintrc" ]]; then
      _eslint_found=true
    fi
  fi
  if [[ "${_eslint_found}" == "true" ]]; then
    _pass "ESLint config"
  else
    _warn "ESLint config — missing (eslint.config.mjs or .eslintrc.* recommended)"
  fi

  # Prettier: .prettierrc or prettier key in package.json
  _prettier_found=false
  if ls "${TARGET}"/.prettierrc* >/dev/null 2>&1; then
    _prettier_found=true
  elif [[ -f "${TARGET}/prettier.config.mjs" ]] || [[ -f "${TARGET}/prettier.config.js" ]]; then
    _prettier_found=true
  elif command -v python3 >/dev/null 2>&1; then
    if python3 -c "
import json, sys
try:
    d = json.load(open('${TARGET}/package.json'))
    sys.exit(0 if 'prettier' in d else 1)
except Exception:
    sys.exit(1)
" 2>/dev/null; then
      _prettier_found=true
    fi
  fi
  if [[ "${_prettier_found}" == "true" ]]; then
    _pass "Prettier config"
  else
    _warn "Prettier config — missing (.prettierrc or prettier key in package.json recommended)"
  fi

  # commitlint.config.mjs
  if [[ ! -f "${TARGET}/commitlint.config.mjs" ]]; then
    _warn "commitlint.config.mjs — missing (commit message linting recommended)"
  else
    _pass "commitlint.config.mjs"
  fi
fi

if [[ "${_has_python}" == "true" ]]; then
  _infoline "Detected stack: Python"

  # ruff.toml or [tool.ruff] in pyproject.toml
  _ruff_found=false
  if [[ -f "${TARGET}/ruff.toml" ]]; then
    _ruff_found=true
  elif grep -q '\[tool\.ruff\]' "${TARGET}/pyproject.toml" 2>/dev/null; then
    _ruff_found=true
  fi
  if [[ "${_ruff_found}" == "true" ]]; then
    _pass "Ruff config"
  else
    _warn "Ruff config — missing (ruff.toml or [tool.ruff] in pyproject.toml recommended)"
  fi

  # .pre-commit-config.yaml
  if [[ ! -f "${TARGET}/.pre-commit-config.yaml" ]]; then
    _warn ".pre-commit-config.yaml — missing (pre-commit hooks recommended for Python)"
  else
    _pass ".pre-commit-config.yaml"
  fi
fi

if [[ "${_has_go}" == "false" ]] && [[ "${_has_node}" == "false" ]] && [[ "${_has_python}" == "false" ]]; then
  _infoline "No known stack detected (no go.mod, package.json, or pyproject.toml found) — tooling checks skipped"
fi

echo ""

# ============================================================
# CHECK 7: CONTRIBUTING.md workflow doc references
# ============================================================
echo "Check 7: Workflow doc references in CONTRIBUTING.md"

CONTRIB="${TARGET}/CONTRIBUTING.md"
if [[ ! -f "${CONTRIB}" ]]; then
  _infoline "CONTRIBUTING.md not found — skipping workflow reference checks"
else
  if grep -qi 'conventional commits' "${CONTRIB}" 2>/dev/null; then
    _pass "CONTRIBUTING.md mentions 'Conventional Commits'"
  else
    _warn "CONTRIBUTING.md does not mention 'Conventional Commits' (project may have its own convention)"
  fi

  if grep -qi 'signed-off-by\|DCO' "${CONTRIB}" 2>/dev/null; then
    _pass "CONTRIBUTING.md mentions 'Signed-off-by' or 'DCO'"
  else
    _warn "CONTRIBUTING.md does not mention 'Signed-off-by' or 'DCO' (project may have its own policy)"
  fi
fi

echo ""

# ============================================================
# CHECK 8: Git hygiene
# ============================================================
echo "Check 8: Git hygiene"

if [[ ! -d "${TARGET}/.git" ]]; then
  _infoline "Not a git repository — git checks skipped"
else
  # Dirty file count (informational only)
  _dirty_count=0
  _dirty_count=$(git -C "${TARGET}" status --porcelain 2>/dev/null | wc -l | tr -d ' ') || true
  _infoline "Dirty files (git status --porcelain): ${_dirty_count}"

  # At least one commit must exist
  if git -C "${TARGET}" log --oneline -1 >/dev/null 2>&1; then
    _last_commit="$(git -C "${TARGET}" log --oneline -1 2>/dev/null || true)"
    _pass "Repository has at least one commit: ${_last_commit}"
  else
    _fail "Repository has no commits (git log returned nothing)"
  fi
fi

echo ""

# ============================================================
# CHECK 9: Claude skills mirror
# ============================================================
echo "Check 9: Claude skills"

# Only check skills when a Claude adapter is present. Codex skills live under
# .codex/skills/ and follow the same pattern; we check that too when applicable.
if [[ "${HAS_CLAUDE}" == "true" || "${HAS_CODEX}" == "true" ]]; then
  # Expected baseline set — these ship in every system release and bootstrap.
  # workflow-runner is the canonical meta-skill and must be present.
  _expected_skills=(
    "workflow-runner"
    "project-intake"
    "requirements-prd"
    "functional-spec"
    "architecture-design"
    "implementation-planning"
    "test-planning"
    "release-readiness"
    "pr-review"
    "adr-write"
    "changelog-update"
    "dependency-review"
  )

  _check_skill_dir() {
    # _check_skill_dir <label> <skills-dir>
    local label="$1" skills_dir="$2"
    if [[ ! -d "${skills_dir}" ]]; then
      _warn "${label} — skills directory missing"
      return
    fi
    local missing=0 skill
    for skill in "${_expected_skills[@]}"; do
      if [[ -f "${skills_dir}/${skill}/SKILL.md" ]]; then
        :  # present
      else
        _warn "${label}/${skill}/SKILL.md — missing (run sync-agent-files.sh)"
        (( missing++ )) || true
      fi
    done
    if (( missing == 0 )); then
      _pass "${label} — all ${#_expected_skills[@]} baseline skills present"
    fi
  }

  if [[ "${HAS_CLAUDE}" == "true" ]]; then
    _check_skill_dir ".claude/skills" "${TARGET}/.claude/skills"
  fi
  if [[ "${HAS_CODEX}" == "true" ]]; then
    _check_skill_dir ".codex/skills" "${TARGET}/.codex/skills"
  fi
else
  _infoline "No adapter detected — skill checks skipped"
fi

echo ""

# ============================================================
# CHECK 10: Workflow-state consistency
# ============================================================
echo "Check 10: Workflow-state consistency"

_state_file="${TARGET}/.ai/workflow/workflow-state.md"
if [[ ! -f "${_state_file}" ]]; then
  # Already reported as a FAIL in Check 1.
  _infoline "workflow-state.md missing — skipped (see Check 1)"
else
  # Recognised phase titles (Phase 0..8 — order matters for the sequence check).
  _valid_phases=(
    "Project Intake"
    "Requirements"
    "Functional Specification"
    "Architecture"
    "Implementation Planning"
    "Implementation"
    "Testing"
    "Release Readiness"
    "Maintenance"
  )

  # Pull the line under "## Current Phase" header (first non-blank line after it).
  _current_phase=""
  _current_phase="$(awk '
    /^## Current Phase/ { found=1; next }
    found && NF > 0 { print; exit }
  ' "${_state_file}" 2>/dev/null || true)"

  if [[ -z "${_current_phase}" ]]; then
    _fail "workflow-state.md — no Current Phase value found"
  else
    # Strip "Phase N:" prefix if present.
    _phase_name="${_current_phase#Phase [0-9]: }"
    _phase_name="${_phase_name#Phase [0-9][0-9]: }"

    _phase_known=false
    for _p in "${_valid_phases[@]}"; do
      if [[ "${_phase_name}" == "${_p}" ]]; then
        _phase_known=true
        break
      fi
    done

    if [[ "${_phase_known}" == "true" ]]; then
      _pass "Current Phase recognised: ${_current_phase}"
    else
      _fail "Current Phase unrecognised: '${_current_phase}' (expected one of: ${_valid_phases[*]})"
    fi
  fi

  # Completed-phases sequence check: once we see an unchecked item, no later
  # item should be checked. This catches typical hand-edit mistakes where
  # someone ticks Testing before Implementation completes.
  _seen_unchecked=false
  _out_of_order=false
  while IFS= read -r line; do
    if [[ "${line}" == "- [ ] "* ]]; then
      _seen_unchecked=true
    elif [[ "${line}" == "- [x] "* ]] || [[ "${line}" == "- [X] "* ]]; then
      if [[ "${_seen_unchecked}" == "true" ]]; then
        _out_of_order=true
        break
      fi
    fi
  done < <(awk '
    /^## Completed Phases/ { found=1; next }
    /^## / && found { exit }
    found { print }
  ' "${_state_file}" 2>/dev/null)

  if [[ "${_out_of_order}" == "true" ]]; then
    _warn "Completed Phases ticked out of order — later phase is checked before an earlier one"
  else
    _pass "Completed Phases sequence is consistent"
  fi
fi

echo ""

# ============================================================
# Final summary
# ============================================================
echo "============================================================"

# Colour the counts
_pass_display="${_c_green}${PASS_COUNT}${_c_reset}"
_warn_display="${_c_yellow}${WARN_COUNT}${_c_reset}"
_fail_display="${_c_red}${FAIL_COUNT}${_c_reset}"

printf '%sdoctor%s: %s  system v%s\n' \
  "${_c_bold}" "${_c_reset}" "${PROJECT_NAME}" "${SYSTEM_VERSION}"
printf '  PASS: %s\n' "${_pass_display}"
printf '  WARN: %s\n' "${_warn_display}"
printf '  FAIL: %s\n' "${_fail_display}"
echo ""
echo "Phase artifacts:"
for _line in "${PHASE_LINES[@]}"; do
  echo "${_line}"
done
echo ""

# Determine exit code
_exit_code=0
if (( FAIL_COUNT > 0 )); then
  _exit_code=1
fi
if [[ "${ARG_STRICT}" == "true" ]] && (( WARN_COUNT > 0 )); then
  _exit_code=1
fi

printf 'Exit: %s\n' "${_exit_code}"
echo ""

exit "${_exit_code}"
