#!/usr/bin/env bash
# init-project.sh — Bootstrap a new project from the AI Engineering System.
#
# Requirements:
#   bash 4+  (macOS ships bash 3.2 by default — install via `brew install bash`)
#   git      (optional; only needed when --git is active, the default)
#
# Usage:
#   ./scripts/init-project.sh --name <name> --stack <stack> [options]
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
# (SC1091 suppressed: SCRIPT_DIR is resolved at runtime; paths are correct)
# ============================================================
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/log.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/args.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/copy.sh"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib/git.sh"

# ============================================================
# Read system version
# ============================================================
VERSION_FILE="${SYSTEM_ROOT}/VERSION"
if [[ -f "${VERSION_FILE}" ]]; then
  SYSTEM_VERSION="$(tr -d '[:space:]' < "${VERSION_FILE}")"
else
  SYSTEM_VERSION="unknown"
  warn "VERSION file not found at ${VERSION_FILE}; using 'unknown'"
fi

# ============================================================
# Constants
# ============================================================
VALID_STACKS=(
  "go-gin-layered"
  "go-gin-clean"
  "go-gin-hexagonal"
  "nestjs-layered"
  "nextjs-default"
  "fastify-hexagonal"
  "fastapi-layered"
  "react-native-expo"
)

VALID_AGENTS=("claude" "codex" "both")

# ============================================================
# Usage
# ============================================================
usage() {
  local stacks_inline="" s
  for s in "${VALID_STACKS[@]}"; do
    stacks_inline="${stacks_inline:+${stacks_inline}, }${s}"
  done
  cat <<EOF
Usage: $(basename -- "$0") --name <name> --stack <stack> [options]

Bootstrap a new project from the AI Engineering System v${SYSTEM_VERSION}.

Required:
  --name  <name>    Project directory name (also used as the project name)
  --stack <stack>   One of: ${stacks_inline}

Options:
  --agent  <agent>  Agent adapter: claude | codex | both  (default: claude)
  --git             Initialise a git repository (default: on)
  --no-git          Skip git initialisation
  --target <path>   Destination path  (default: ./<name>)
  --help, -h        Print this help and exit

Examples:
  $(basename -- "$0") --name my-api --stack go-gin-hexagonal
  $(basename -- "$0") --name my-api --stack nestjs-layered --agent both --target ~/projects/my-api
EOF
}

# ============================================================
# Argument parsing
# ============================================================
ARG_NAME=""
ARG_STACK=""
ARG_AGENT="claude"
ARG_GIT=true
ARG_TARGET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)
      [[ $# -lt 2 ]] && die "--name requires a value"
      ARG_NAME="$2"; shift 2 ;;
    --stack)
      [[ $# -lt 2 ]] && die "--stack requires a value"
      ARG_STACK="$2"; shift 2 ;;
    --agent)
      [[ $# -lt 2 ]] && die "--agent requires a value"
      ARG_AGENT="$2"; shift 2 ;;
    --git)
      ARG_GIT=true; shift ;;
    --no-git)
      ARG_GIT=false; shift ;;
    --target)
      [[ $# -lt 2 ]] && die "--target requires a value"
      ARG_TARGET="$2"; shift 2 ;;
    --help|-h)
      usage; exit 0 ;;
    -*)
      error "Unknown flag: $1"
      usage >&2
      exit 1 ;;
    *)
      # Accept a positional first argument as --name for convenience.
      if [[ -z "${ARG_NAME}" ]]; then
        ARG_NAME="$1"; shift
      else
        error "Unexpected argument: $1"
        usage >&2
        exit 1
      fi ;;
  esac
done

# ============================================================
# Validation
# ============================================================
require_arg "--name" "${ARG_NAME}"
require_arg "--stack" "${ARG_STACK}"

if ! contains_element "${ARG_STACK}" "${VALID_STACKS[@]}"; then
  _sv=""; for _s in "${VALID_STACKS[@]}"; do _sv="${_sv:+${_sv}, }${_s}"; done
  die "Invalid --stack '${ARG_STACK}'. Valid values: ${_sv}"
fi

if ! contains_element "${ARG_AGENT}" "${VALID_AGENTS[@]}"; then
  die "Invalid --agent '${ARG_AGENT}'. Valid values: ${VALID_AGENTS[*]}"
fi

# Resolve target directory.
if [[ -z "${ARG_TARGET}" ]]; then
  ARG_TARGET="./${ARG_NAME}"
fi
# Convert to absolute path (target may not exist yet).
TARGET_DIR="$(resolve_path "${ARG_TARGET}")"
PROJECT_NAME="${ARG_NAME}"
DATE_ISO="$(date +%Y-%m-%d)"

info "AI Engineering System v${SYSTEM_VERSION} — init-project"
info "  project : ${PROJECT_NAME}"
info "  stack   : ${ARG_STACK}"
info "  agent   : ${ARG_AGENT}"
info "  git     : ${ARG_GIT}"
info "  target  : ${TARGET_DIR}"

# ============================================================
# Step 1: Create target directory — fail if non-empty
# ============================================================
if [[ -d "${TARGET_DIR}" ]]; then
  if [[ -n "$(ls -A "${TARGET_DIR}" 2>/dev/null)" ]]; then
    die "Target directory '${TARGET_DIR}' already exists and is non-empty. Aborting."
  fi
else
  mkdir -p "${TARGET_DIR}"
fi

# ============================================================
# Step 2: Copy skeleton (if it exists)
# ============================================================
SKELETON_DIR="${SYSTEM_ROOT}/templates/skeletons/${ARG_STACK}"
if [[ -d "${SKELETON_DIR}" ]]; then
  info "Copying skeleton: ${ARG_STACK}"
  cp -R "${SKELETON_DIR}/." "${TARGET_DIR}/"
else
  warn "Skeleton for '${ARG_STACK}' not yet available in this system version (v${SYSTEM_VERSION})."
  warn "The script will continue — agent files, workflow docs, and git init will still be set up."
  warn "L2 (stack-skeleton extraction) will populate templates/skeletons/ in a later wave."
fi

# ============================================================
# Step 3: Render workflow files from templates
# ============================================================
TEMPLATES_DIR="${SYSTEM_ROOT}/templates/project-files"
WORKFLOW_DIR="${TARGET_DIR}/.ai/workflow"
mkdir -p "${WORKFLOW_DIR}"

_workflow_templates=(
  "project-context.md"
  "workflow-state.md"
  "active-task.md"
  "service-map.md"
)

SUBSTITUTIONS=(
  "SYSTEM_VERSION=${SYSTEM_VERSION}"
  "PROJECT_NAME=${PROJECT_NAME}"
  "STACK=${ARG_STACK}"
  "DATE=${DATE_ISO}"
)

for tpl in "${_workflow_templates[@]}"; do
  src="${TEMPLATES_DIR}/${tpl}"
  dst="${WORKFLOW_DIR}/${tpl}"
  if [[ -f "${src}" ]]; then
    render_template "${src}" "${dst}" "${SUBSTITUTIONS[@]}"
    info "  rendered: .ai/workflow/${tpl}"
  else
    warn "  Template not found: ${src} — skipping"
  fi
done

# Inject system_version header into project-context.md if the template
# does not already contain the {{SYSTEM_VERSION}} placeholder.
PCTX="${WORKFLOW_DIR}/project-context.md"
if [[ -f "${PCTX}" ]]; then
  if ! grep -q "system_version" "${PCTX}" 2>/dev/null; then
    printf '\n---\n_Bootstrapped by ai-engineering-system v%s on %s_\n' \
      "${SYSTEM_VERSION}" "${DATE_ISO}" >> "${PCTX}"
  fi
fi

# ============================================================
# Step 4: Generate stack-appropriate static files via heredoc
# ============================================================

# ----------------------------------------------------------
# README.md
# ----------------------------------------------------------
cat > "${TARGET_DIR}/README.md" <<EOREADME
# ${PROJECT_NAME}

This project was bootstrapped with the [AI Engineering System](https://github.com/your-org/ai-engineering-system) v${SYSTEM_VERSION} using the \`${ARG_STACK}\` stack profile.

## Quickstart

Follow the Phase 0 intake in \`.ai/workflow/project-context.md\` to complete the project context, then proceed through the AI workflow phases documented in \`CLAUDE.md\` (or \`.codex/\`) and the workflow docs.
EOREADME
info "  generated: README.md"

# ----------------------------------------------------------
# CHANGELOG.md  (Keep-a-Changelog Unreleased stub)
# ----------------------------------------------------------
cat > "${TARGET_DIR}/CHANGELOG.md" <<EOCHANGELOG
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
EOCHANGELOG
info "  generated: CHANGELOG.md"

# ----------------------------------------------------------
# .gitignore  (stack-appropriate)
# ----------------------------------------------------------
_go_ignores() {
  cat <<EOGI
# Go
vendor/
bin/
*.test
*.out
coverage.html
coverage.txt
dist/
tmp/
EOGI
}

_node_ignores() {
  cat <<EONODEI
# Node / Next.js / NestJS / Fastify
node_modules/
.next/
dist/
.env
.env.local
.env.*.local
coverage/
.turbo/
.vercel/
out/
EONODEI
}

_python_ignores() {
  cat <<EOPYI
# Python
__pycache__/
*.py[cod]
*\$py.class
.venv/
venv/
.pytest_cache/
.mypy_cache/
.ruff_cache/
*.egg-info/
build/
dist/
.coverage
.coverage.*
htmlcov/
.env
.env.local
EOPYI
}

_mobile_ignores() {
  cat <<EOMI
# React Native / Expo
node_modules/
.expo/
.expo-shared/
dist/
ios/Pods/
ios/build/
android/build/
android/.gradle/
android/app/build/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
.env
.env.local
EOMI
}

_common_ignores() {
  cat <<EOCOMMON
# Common
.DS_Store
*.log
*.log.*
*.swp
*.swo
.idea/
.vscode/
*.tmp
EOCOMMON
}

{
  case "${ARG_STACK}" in
    go-*)
      _go_ignores ;;
    nestjs-*|nextjs-*|fastify-*)
      _node_ignores ;;
    fastapi-*)
      _python_ignores ;;
    react-native-*)
      _mobile_ignores ;;
  esac
  echo ""
  _common_ignores
} > "${TARGET_DIR}/.gitignore"
info "  generated: .gitignore"

# ----------------------------------------------------------
# .env.example
# ----------------------------------------------------------
cat > "${TARGET_DIR}/.env.example" <<EOENV
# Add required env vars here.
# Copy this file to .env and fill in your values.
# Do NOT commit .env to version control.
EOENV
info "  generated: .env.example"

# ============================================================
# Step 5: Copy agent adapter files
# ============================================================
CLAUDE_SRC="${SYSTEM_ROOT}/claude"
CODEX_SRC="${SYSTEM_ROOT}/codex"

_copy_claude() {
  info "  Copying Claude adapter files"
  if [[ -f "${CLAUDE_SRC}/CLAUDE.md" ]]; then
    cp "${CLAUDE_SRC}/CLAUDE.md" "${TARGET_DIR}/CLAUDE.md"
  else
    warn "  claude/CLAUDE.md not found — skipping"
  fi

  if [[ -d "${CLAUDE_SRC}/.claude" ]]; then
    mkdir -p "${TARGET_DIR}/.claude"
    cp -R "${CLAUDE_SRC}/.claude/." "${TARGET_DIR}/.claude/"
  else
    warn "  claude/.claude/ not found — skipping"
  fi
}

_copy_codex() {
  info "  Copying Codex adapter files"
  if [[ -d "${CODEX_SRC}/.codex" ]]; then
    mkdir -p "${TARGET_DIR}/.codex"
    cp -R "${CODEX_SRC}/.codex/." "${TARGET_DIR}/.codex/"
  else
    warn "  codex/.codex/ not found — skipping"
  fi
}

case "${ARG_AGENT}" in
  claude) _copy_claude ;;
  codex)  _copy_codex ;;
  both)   _copy_claude; _copy_codex ;;
esac

# ============================================================
# Step 5b: Copy tooling configs based on stack
# ============================================================
TOOLING_SRC="${SYSTEM_ROOT}/tooling"

_copy_dir_contents() {
  # _copy_dir_contents <src-dir> <dst-dir>
  # Copies all files (including dotfiles) from src into dst, creating dst if needed.
  # No-op if src doesn't exist.
  local src="$1" dst="$2"
  [[ -d "$src" ]] || return 0
  mkdir -p "$dst"
  # shellcheck disable=SC2086
  cp -R "${src}/." "${dst}/"
}

_copy_shared_tooling() {
  # Common-to-every-project pieces from tooling/shared/.
  # Skip the .editorconfig and .gitignore.* files because stack-specific configs
  # supply better versions; skip the per-language .gitignore variants entirely (users
  # can pick the right one from the system if they want).
  local src="${TOOLING_SRC}/shared"
  [[ -d "$src" ]] || return 0
  for f in .markdownlint.jsonc commitlint.config.mjs .commitizen.yaml .gitattributes .pre-commit-config.shared.yaml; do
    [[ -f "${src}/${f}" ]] && cp "${src}/${f}" "${TARGET_DIR}/${f}"
  done
}

_copy_tooling_for_stack() {
  info "  Copying tooling configs"
  case "${ARG_STACK}" in
    go-gin-*)
      _copy_dir_contents "${TOOLING_SRC}/go" "${TARGET_DIR}"
      ;;
    nestjs-*)
      _copy_dir_contents "${TOOLING_SRC}/nodejs" "${TARGET_DIR}"
      _copy_dir_contents "${TOOLING_SRC}/nestjs" "${TARGET_DIR}"
      ;;
    nextjs-*)
      _copy_dir_contents "${TOOLING_SRC}/nodejs" "${TARGET_DIR}"
      _copy_dir_contents "${TOOLING_SRC}/nextjs" "${TARGET_DIR}"
      ;;
    fastify-*)
      # Fastify uses the generic Node tooling; no framework-specific overlay.
      _copy_dir_contents "${TOOLING_SRC}/nodejs" "${TARGET_DIR}"
      ;;
    fastapi-*)
      _copy_dir_contents "${TOOLING_SRC}/python" "${TARGET_DIR}"
      ;;
    react-native-*)
      # Mobile projects share the Node base. Framework-specific configs (eslint-config-expo,
      # jest-expo) already live inside the skeleton's package.json.
      _copy_dir_contents "${TOOLING_SRC}/nodejs" "${TARGET_DIR}"
      ;;
    *)
      warn "  No tooling profile for stack '${ARG_STACK}' — skipping"
      return 0
      ;;
  esac
  _copy_shared_tooling
}

if [[ -d "${TOOLING_SRC}" ]]; then
  _copy_tooling_for_stack
else
  warn "tooling/ not present in this system version — skipping tooling copy"
fi

# ============================================================
# Step 6: Git init + initial commit
# ============================================================
if [[ "${ARG_GIT}" == "true" ]]; then
  git_init_repo "${TARGET_DIR}" "main"
  git_initial_commit "${TARGET_DIR}" \
    "chore: bootstrap from ai-engineering-system v${SYSTEM_VERSION}"
fi

# ============================================================
# Done — print next-steps banner
# ============================================================
cat <<EOBANNER

✅ Bootstrapped: ${TARGET_DIR}
   stack   : ${ARG_STACK}
   agent   : ${ARG_AGENT}
   system  : v${SYSTEM_VERSION}

Next steps:
  1. cd ${TARGET_DIR}
  2. Open .ai/workflow/project-context.md and complete Phase 0 intake.
  3. Read CLAUDE.md (or .codex/) and the workflow phase docs.

EOBANNER
