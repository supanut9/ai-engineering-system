# governance

This document covers how the AI Engineering System evolves as a project: the rhythm of releases, who decides what gets in, how new stacks and standards are added, the deprecation process, and what users can expect from a stable v1.0. It picks up where [contributing](contributing.md) leaves off — CONTRIBUTING describes how to submit changes; this document describes how those changes are evaluated and released.

## release model

The system follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The canonical version is the `VERSION` file at the repo root; every other reference (`CHANGELOG.md`, the `system_version` key in bootstrapped project-context files, release tags) is derived from it.

**Pre-1.0 (`0.x`) rules:**
- Breaking changes are allowed in minor version bumps (e.g., `0.1.0` → `0.2.0`).
- Bug fixes and non-breaking improvements land in patch bumps (e.g., `0.1.0` → `0.1.1`).
- "Breaking" means a downstream bootstrapped project must take action — rename a file, change an env var, update a script argument — to stay compatible.

**Post-1.0 rules:**
- Breaking changes require a major version bump.
- Deprecated artifacts remain functional for at least one full minor version after the `Deprecated` CHANGELOG entry before they can be removed.
- Removal appears in the `Removed` section of the CHANGELOG in the subsequent release.

**Cadence:** releases are not time-based. A release ships when there is a coherent set of improvements ready. During `0.x` development the target is roughly monthly; this is a goal, not a commitment. Patch releases ship as needed for regressions or critical fixes.

**Automation:** releases are managed by `release-please`. When commits land on `main`, the action keeps a release PR open that drafts the next CHANGELOG entry and bumps `VERSION`. To ship a release, merge the release PR. Do not manually tag or edit `CHANGELOG.md` outside of that flow. The full maintainer process is documented in the [contributing guide](contributing.md).

## decision rights

The repo maintainer has final say over what merges and when.

**Discussion required (open an issue first):**
- Adding a new stack profile.
- Adding a new standard.
- Adding or renumbering a workflow phase.
- Changing the mandatory file set that `init-project.sh` emits.
- Changing the CLI surface of any script.
- Any change that requires a migration guide.

Use the `[feature]` issue template for net-new additions; use the `[gap]` template when the system failed to cover a real-world need.

**PRs without a prior issue (editorial changes):**
- Typo fixes and grammar corrections.
- Broken link repairs.
- Doc polish that does not change normative behavior.

**Lazy consensus rule:** a proposal that sits in an issue for 14 calendar days without substantive objection is considered accepted. At that point the maintainer must either merge a corresponding PR or close the issue with an explanation. Silence is not a blocker; objections must be substantive (explain why the proposal is wrong, not just that you'd prefer something different).

## proposal lifecycle

New stacks, new standards, and workflow changes follow four stages:

**Proposed** — an issue is opened with:
- rationale: why this stack or standard fills a gap not covered by existing content;
- prior art: other tooling or docs that do something similar;
- tradeoffs: what adopting this costs in complexity or maintenance.

**Accepted** — the maintainer adds the `accepted` label after discussion. Implementation can begin. The author should open a draft PR and link it to the issue.

**Implemented** — the PR(s) land on `main`. A `[Unreleased]` CHANGELOG entry describes what was added. The feature is live in the repo but not yet in a tagged release.

**Released** — the change is included in a tagged release. If it changes downstream behavior, a migration page is added under `docs/migrations/`.

## adding a new stack profile

1. Open a `[feature]` issue: which stack, why it belongs in the system, who uses it.
2. Maintainer marks the issue `accepted`.
3. Write `stacks/<name>.md` using existing stack profiles as the shape reference.
4. Write a project-template blueprint at `project-templates/<lang>/<arch>.md`.
5. Write a runnable starter skeleton at `templates/skeletons/<stack-id>/`.
6. Wire `scripts/init-project.sh`: add the stack id to the `VALID_STACKS` array and add a tooling-copy case.
7. Wire `scripts/selftest.sh`: if the stack belongs to an existing language family (`NODE_STACKS`, `PYTHON_STACKS`, etc.), add it there; add a new family constant if needed.
8. Add CI coverage: add an entry to the selftest matrix in `.github/workflows/ci.yml`.
9. Update the stack list in `README.md`'s Quickstart section.
10. Add a CHANGELOG entry under `Added`.

The PR must pass the full CI suite, including the selftest matrix, before merge.

## adding a new standard

1. Open a `[feature]` issue: which standard, what gap it fills.
2. Maintainer marks the issue `accepted`.
3. Write `standards/<name>.md`.
4. Update `mkdocs.yml` nav under the "Standards" section.
5. Update any workflow doc or stack profile that should cross-reference the new standard.
6. Add a CHANGELOG entry under `Added`.

## adding a new workflow phase

Workflow phase changes affect every downstream project. The bar is higher.

1. Open an RFC-style issue with the `[gap]` label. Include: the problem the new phase solves, where it fits in the existing sequence, what artifacts it produces, and what its exit gate is.
2. Leave the issue open for at least two weeks of discussion. The maintainer and at least one other engaged contributor must agree before the issue is marked `accepted`.
3. The PR must update all of:
   - `workflow/ai-workflow.md`
   - `workflow/phase-gates.md`
   - at least one skill or agent doc that operates in the new phase
4. Update `examples/hello-todo-go/` to demonstrate the new phase artifact, or document in the PR description why the example is exempt.
5. If existing phase numbering shifts, bump the major version. If the new phase is purely additive (appended at the end, no renumbering), a minor bump is sufficient.

## deprecation policy

When an artifact (stack profile, template, skill, standard, script flag) is deprecated:

- Announce the deprecation in the CHANGELOG under `Deprecated` in the release where the decision is made.
- The deprecated artifact remains functional for at least one full minor version after that release.
- Removal appears in the `Removed` CHANGELOG section in the subsequent release.
- Migration guidance must be written at `docs/migrations/<from>-to-<to>.md` before the removing release ships.

The deprecation notice should include: what is deprecated, why, and what replaces it.

## drift, doctor, and the system version stamp

Every project bootstrapped from this system records the system version in `.ai/workflow/project-context.md` under the key `system_version`. This is the version of the system at bootstrap time.

`scripts/doctor.sh` — run inside a bootstrapped project to check for drift:
- required workflow files exist;
- `workflow-state.md` is in a valid phase;
- adapter files (CLAUDE.md, .codex/) match the recorded system version;
- lint and tooling configs are present.

`scripts/sync-agent-files.sh` — pulls updated adapter files from the current system version into an existing project. Useful after a system minor bump that ships updated Claude or Codex adapter content.

Both tools are advisory: they report what is out of date; they do not auto-mutate application code or decisions.

## forks and divergence

This system is opinionated by design. Forks are welcome under the MIT License.

If a fork diverges substantially in scope or philosophy, the maintainer may suggest the fork rename itself and acknowledge its origin in its own README. This is a courtesy convention, not a legal requirement. MIT permits any use, including forks that don't credit the source.

If you are maintaining a fork and find something that would improve the upstream, open an issue or PR. Divergence that benefits the original is worth bringing back.

## see also

- [Contributing](contributing.md) — how to submit changes, branch policy, commit format, release process
- Security policy — see `SECURITY.md` in the repo root
- [Changelog](changelog.md) — release history
- [Migrations index](migrations/README.md) — version-to-version migration notes for downstream projects
