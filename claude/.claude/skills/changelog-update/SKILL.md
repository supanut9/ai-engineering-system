---
name: changelog-update
description: Use when shipping a user-visible change to update CHANGELOG.md under the [Unreleased] section following Keep-a-Changelog format.
---

# changelog update

Cross-cutting maintenance skill — applies at the end of any feature, fix, or breaking-change task.
Reference: `../../project-files/CHANGELOG.md`, `../../project-files/CONTRIBUTING.md`.

## when to use

- A feature, fix, or breaking change task is complete and ready for review or merge.
- The PR checklist requires a CHANGELOG entry.
- Release preparation requires auditing what is in `[Unreleased]` before tagging.
- An existing entry needs clarity polish before a release tag is applied.

> Note: release-please autogenerates entries from Conventional Commits. Manual edits via this skill are for clarity polish, grouping, or cases where the commit message alone is insufficient for a user audience.

## what to produce

One or more lines added under the appropriate category inside `[Unreleased]` in `CHANGELOG.md` at the repo root.

Keep-a-Changelog 1.1.0 categories, in order:

| Category | Use for |
|---|---|
| **Added** | New features or capabilities. |
| **Changed** | Changes to existing behavior (non-breaking). |
| **Deprecated** | Features that will be removed in a future release. |
| **Removed** | Features removed in this release. |
| **Fixed** | Bug fixes. |
| **Security** | Vulnerability fixes. |

## process

1. **Identify the change type.** Read the PR description, commit message, or task brief. Map the change to one Keep-a-Changelog category. If a single PR spans multiple categories, write a separate line for each.

2. **Check for breaking changes.** If the change alters an existing public API, removes a field, or changes default behavior, it belongs in **Changed** (or **Removed**) and must include a migration hint. Breaking changes must not appear only under "Fixed" or "Added".

3. **Write the entry in the user's voice.** The reader is a developer consuming the project, not the developer who made the change. Write what changed from their perspective, not what code was modified.
   - Good: `Added support for paginated list responses on all collection endpoints.`
   - Bad: `Refactored handler middleware to pass page/limit query params downstream.`

4. **Reference the issue or PR.** Append `([#123](link))` if a GitHub issue or PR number is available.

5. **Keep entries to one line each.** If a change needs two sentences, the first sentence is the changelog entry; additional detail belongs in the PR description or docs.

6. **Confirm user-visibility.** Ask: "Would a user upgrading to the next version need to know about this?" If no, the entry does not belong in CHANGELOG.

7. **Insert under `[Unreleased]`.** Place the line under the correct category heading. Create the category heading if it does not yet exist. Do not alter released version sections.

## templates to reference

- `CHANGELOG.md` at repo root — Keep-a-Changelog 1.1.0 format with `[Unreleased]` block.
- `CONTRIBUTING.md#commit-message-format` — Conventional Commit types that map to changelog categories.

## quality checks

- Entry is written in the user's voice, not the implementer's.
- Category heading is correct (Added / Changed / Deprecated / Removed / Fixed / Security).
- One line per change; no run-on entries.
- Breaking changes appear in Changed or Removed with a migration hint.
- No implementation-detail noise (no mention of file names, internal function names, or refactors invisible to users).

## anti-patterns

- **Restating the commit subject verbatim.** Commit messages are for maintainers; changelog entries are for users. Rewrite for the audience.
- **Hiding breaking changes in Fixed or Added.** Breaking changes that appear only as "Added X behavior" without noting the previous behavior was removed will surprise upgraders.
- **Including pre-release internal refactors.** Infrastructure changes, test reorganization, and tooling upgrades that have zero user-visible effect do not belong in CHANGELOG.
- **Writing multiple entries per line.** Each distinct change gets its own line, even if one PR contains many.
- **Editing released version sections.** Only `[Unreleased]` is writable. Past version blocks are immutable once tagged.
