#!/usr/bin/env bash
# lib/git.sh — Git initialization and commit helpers.
#
# Provides:
#   git_init_repo    <target_dir> <branch>
#   git_initial_commit <target_dir> <message>
#
# Usage:
#   source "$SCRIPT_DIR/lib/git.sh"
#   git_init_repo    /path/to/project main
#   git_initial_commit /path/to/project "chore: bootstrap from system v0.0.1"

[[ -n "${_AES_GIT_SH:-}" ]] && return 0
readonly _AES_GIT_SH=1

# ---------------------------------------------------------------------------
# git_init_repo <target_dir> <branch>
#   Initialises a git repo at <target_dir> with the specified initial branch.
# ---------------------------------------------------------------------------
git_init_repo() {
  local target="$1"
  local branch="${2:-main}"

  if ! command -v git >/dev/null 2>&1; then
    warn "git not found — skipping git init"
    return 0
  fi

  info "Initialising git repository (branch: ${branch})"
  if git init -q -b "${branch}" "${target}" 2>/dev/null; then
    return 0
  fi

  # Older git (<2.28) does not support -b; fall back.
  warn "git init -b not supported; initialising and renaming branch"
  git init -q "${target}"
  # Rename only if a default branch was created (may not exist until first commit).
  git -C "${target}" symbolic-ref HEAD "refs/heads/${branch}" 2>/dev/null || true
}

# ---------------------------------------------------------------------------
# git_initial_commit <target_dir> <commit_message>
#   Stages all files in <target_dir> and creates an initial commit.
#   Does NOT fail the caller if the commit fails (e.g., pre-commit hook blocks).
# ---------------------------------------------------------------------------
git_initial_commit() {
  local target="$1"
  local msg="$2"

  if ! command -v git >/dev/null 2>&1; then
    return 0
  fi

  if ! git -C "${target}" add -A 2>/dev/null; then
    warn "git add failed — skipping initial commit"
    return 0
  fi

  if git -C "${target}" commit -q --no-gpg-sign -m "${msg}" 2>/dev/null; then
    info "Initial commit created"
  else
    warn "Initial commit failed (a pre-commit hook may have blocked it). Continue manually."
  fi
}
