---
name: pr-review
description: Use when reviewing a pull request — your own or someone else's — to apply consistent review focus and produce actionable feedback.
---

# pr review

Cross-cutting maintenance skill — applies in any phase where a PR is open.
Reference: `../../project-files/CONTRIBUTING.md`, `../../workflow/phase-gates.md`.

## when to use

- Prompted with "review this PR", "look at this diff", "is this ready to merge", or similar.
- Self-review before requesting a human reviewer.
- Checking whether a PR satisfies a phase gate before it can advance.

## what to produce

A structured review comment posted to the PR (or returned as a review document) with the following sections:

| Section | Purpose |
|---|---|
| **summary** | One-paragraph description of what the change does and whether the approach is sound. |
| **blocking issues** | Changes required before merge. Each item must cite a specific file and line. |
| **suggestions** | Non-blocking improvements with rationale for why each would improve the code. |
| **nits** | Optional, low-priority style or wording observations. Clearly marked `[nit]`. |
| **what's good** | At least one acknowledgment of things done well. |

## process

1. **Read the PR description.** Verify it explains what changes and why. If the description is empty or unclear, flag it as a blocking issue before reading the diff.

2. **Check CI status.** If CI is failing, report the failure category (build / lint / test) as a blocking issue. Do not complete the review until CI passes or the failure is explicitly acknowledged.

3. **Check CONTRIBUTING.md checklist.** Load `.github/PULL_REQUEST_TEMPLATE.md` and `CONTRIBUTING.md`. Confirm every checklist item is ticked or documented as N/A. Missing items are blocking.

4. **Run `gh pr diff` or `git diff base...HEAD`.** Walk the diff file-by-file in the order shown. For each file:
   - Understand the intent before evaluating correctness.
   - Note logic errors, missing error handling, security concerns, or API contract violations as blocking.
   - Note improvements (readability, naming, efficiency) as suggestions.

5. **Check test coverage.** For every new function or changed behavior, confirm a test was added or updated. Missing tests for non-trivial logic are blocking.

6. **Check documentation.** For any user-visible behavior change, confirm relevant docs (README, OpenAPI spec, runbook, usage examples) are updated. Missing docs are blocking.

7. **Check CHANGELOG.** For user-visible changes, confirm an entry exists under `[Unreleased]` in `CHANGELOG.md`. Use the `changelog-update` skill if an entry is missing.

8. **Write structured feedback** using the section format above. Group blocking issues together; do not bury them inside suggestions.

## templates to reference

- `.github/PULL_REQUEST_TEMPLATE.md` — checklist items the PR author should have completed.
- `CONTRIBUTING.md` — branching, commit format, and review expectations.

## quality checks

- Every blocking issue cites a specific file path and line range.
- Every suggestion includes a `why` clause explaining the benefit.
- Nits are explicitly marked `[nit]` so the author knows they are optional.
- The "what's good" section is present and genuine — not a boilerplate filler line.
- The review does not contain rewritten code blocks unless the author explicitly asked for a fix suggestion.

## anti-patterns

- **Rewriting the author's code in the comment.** Describe the problem and the desired outcome; let the author write the fix. Exception: a short one-liner correction when the exact form matters.
- **Nit-picking style without an enforced linter.** If there is no linter rule that enforces the style, mark it `[nit]` or omit it. Do not block a PR on subjective preferences.
- **Approving without reading tests.** Test quality directly predicts production reliability. A PR without meaningful tests is not review-complete.
- **Bundling unrelated concerns.** If a PR is too large to review coherently, that is itself a blocking issue: request a split.
- **Repeating the same comment multiple times across files.** File one blocking issue for a pattern; note the other occurrences as a list.
