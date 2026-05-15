---
name: dependency-review
description: Use when triaging incoming dependency-bump pull requests (Dependabot, Renovate, manual) — decide which to merge, hold, or close, and how to verify safely.
---

# Dependency review

Triage incoming dependency-bump pull requests in a way that keeps the repo current without burning a day on noise. Most bumps are safe; a few warrant attention; many can be batch-merged once CI is green.

## When to use

- Dependabot or Renovate has opened one or more PRs in the repo's queue.
- A maintainer asks "what should we merge from the dependency inbox?"
- A scheduled review window (weekly / monthly) for bumping dependencies.
- After a CVE alert or `npm audit` / `pip-audit` / `govulncheck` finding.
- Any prompt mentioning "dependabot", "renovate", "bump", "dependency updates", or "version bump".

## What to produce

For each PR (or grouped set of PRs):

- A merge decision: `merge` / `hold` / `close`.
- A one-line reason citing the diff, the CI signal, or the upstream notes.
- If `hold`: what specifically needs to happen before it can merge (manual test, breaking-change review, parallel migration).
- If `close`: why the bump is not wanted (incompatible with current stack pin, blocked by a downstream constraint, etc.).

For a batch session, produce a short summary at the end: how many merged, how many held, how many closed.

## Process

1. **List the inbox.** `gh pr list --author 'app/dependabot' --state open --limit 50` (or include `renovate-bot`, `app/renovate`, etc.).
2. **Group by ecosystem and risk class** before opening any single PR:
   - Patch bumps (`x.y.Z`): default-safe, batch-merge once CI is green.
   - Minor bumps (`x.Y.0`): default-safe when changelogs report no breaking changes; spot-check the changelog link in the PR body.
   - Major bumps (`X.0.0`): hold by default; read the upstream migration notes before merging.
   - GitHub Actions bumps (`actions/checkout@v6`): read the release notes — major action bumps occasionally remove inputs the workflow uses.
   - CI / lint / formatter bumps: low risk for runtime behavior but can change which warnings fire on `--strict`; check the linked changelog.
3. **Read the diff** of each PR with `gh pr diff <N>`. For a bump, the diff is usually one line in a lockfile + one line in the manifest. Skim for surprises (a "version bump" that also rewrites unrelated files is a yellow flag).
4. **Check CI status.** `gh pr checks <N>`. If green, the PR has already proven build + tests still pass. If red, look at the failing job log before deciding.
5. **For grouped Dependabot PRs** (e.g., `gomod-minor-patch group`), one PR = many bumps. Read the PR body's summary table; CI green on a group PR means all bumps verified together.
6. **Apply the decision.**
   - Merge: `gh pr merge <N> --squash --auto` (with `--auto`, the merge fires when checks pass).
   - Hold: leave a comment explaining what's needed, label with `needs-review` or similar.
   - Close: `gh pr close <N> --comment "..."` — explain why; Dependabot will mark it ignored and not reopen.
7. **For major bumps,** consider opening a tracking issue if a non-trivial migration is required. Don't merge and patch in the same session — give the migration its own PR.
8. **After the session,** verify the dependency files are coherent — run `make setup && make test && make lint` in any project that received bumps to confirm green.

## Templates to reference

- `.github/dependabot.yml` — what the project considers worth bumping and how often. Tweak grouping here if too many PRs are opening per cycle.
- `CHANGELOG.md` — add a `Changed` entry for non-trivial bumps (major versions, security patches, anything user-visible). Patch-bump noise does not need a CHANGELOG entry.
- `CONTRIBUTING.md` — the Conventional Commits scope `chore(deps):` is reserved for these PRs; release-please will fold them into the next CHANGELOG `chore` section automatically.

## Quality checks

- Every PR decision cites a concrete signal: diff, CI status, changelog, or migration note. "Looks fine" is not a decision.
- Major bumps are held by default unless the maintainer has explicitly opted in.
- Grouped patch bumps are merged in batches (don't approve 30 PRs one at a time when a group PR exists or can be configured).
- Closed PRs explain why so Dependabot doesn't immediately re-open them (it won't, but other contributors deserve the reasoning).
- After a merge session, the main branch's CI is green (no transient lockfile conflicts left behind).

## Anti-patterns

- Merging every bump because CI is green. Major-version action bumps and major-version framework bumps deserve a read before merge.
- Holding every bump because some bumps are risky. The inbox grows linearly and review fatigue makes triage worse, not better.
- Closing a bump without explanation. The next reviewer (or future you) has to re-derive the reasoning.
- Merging one bump at a time when group PRs are an option. Configure `dependabot.yml` to group minor+patch bumps per ecosystem if the project doesn't already.
- Ignoring `chore(deps):` PRs entirely. Old dependencies accumulate CVE exposure; the cheapest patch is the one merged this week.
- Bumping a transitive dependency directly. If a sub-dep needs a patch, do it via the parent's bump or via a `resolutions` / `overrides` pin only when justified.

## See also

- [`adr-write`](../adr-write/SKILL.md) — when a major bump requires a migration that warrants an ADR.
- [`changelog-update`](../changelog-update/SKILL.md) — for user-visible dependency changes.
- [`pr-review`](../pr-review/SKILL.md) — for any non-trivial bump that needs human review.
