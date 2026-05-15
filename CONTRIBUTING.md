# Contributing

Thanks for your interest in improving the AI Engineering System. This guide describes how to propose and submit changes.

## Scope of contributions welcome

- New stack profiles (`stacks/*.md`) and matching project templates (`project-templates/<lang>/*.md`).
- New or refined standards (`standards/*.md`).
- New filled-in examples under `examples/` that follow the 8-phase workflow.
- Improvements to the bootstrap and verification scripts (`scripts/`).
- Doc clarifications, typo fixes, and link repairs.
- Adapter improvements (`claude/`, `codex/`) — including new skills and agent definitions.

Substantial new features should be discussed in an issue first, especially anything that changes the workflow phase set, the init script's CLI surface, or the adapter file layout.

## Getting started

1. Fork and clone the repo.
2. Read the roadmap and current state: open `README.md` and `VERSION`.
3. Make sure the verification harness passes on your machine before changing anything:
   - `./scripts/verify-example.sh` — verifies the reference example.
   - `./scripts/selftest.sh --stacks go-gin-hexagonal` — verifies a representative bootstrap.

Requirements:
- Bash 4 or newer (macOS users: `brew install bash`; the system gates on this at script start).
- Go 1.23 or newer (for Go skeletons and the example).
- Node 22 LTS or newer with `npm` (for NestJS and Next.js skeletons).
- `shellcheck` and `markdownlint-cli2` (recommended; CI runs them).

## Branch and PR policy

- Branch from `main`. Use short descriptive prefixes: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `chore/<topic>`.
- One logical change per PR. Small PRs are reviewed and merged faster.
- The PR title follows **Conventional Commits** (see below).
- PRs must pass CI before merge. The CI lanes are: shell lint, markdown lint, GitHub Actions lint, the example verifier, and the multi-stack self-test.
- One maintainer approval is required to merge. Until the project has a team, the maintainer may self-merge after CI is green.

## Commit message format — Conventional Commits

This is required because release automation (`release-please`) reads commit messages to bump the version and update `CHANGELOG.md`.

Format:

```
<type>(<scope>): <subject>

<optional body — explain WHY, not what>

<optional footer — BREAKING CHANGE: ..., Refs: #123, Co-authored-by: ...>
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`, `ci`, `build`, `revert`.

Scope examples (use what fits; keep one word):
- `init` — bootstrap script
- `skeletons` — stack starter trees
- `workflow` — `workflow/*.md`
- `standards` — `standards/*.md`
- `stack:go` / `stack:nextjs` / `stack:nestjs` — stack profile or template
- `tooling:node` / `tooling:go` / `tooling:python` — concrete tooling configs
- `adapter:claude` / `adapter:codex`
- `docs`, `examples`, `ci`, `deps`

Subject: imperative mood, no trailing period, ≤72 characters.

Examples:

```
feat(init): add --license override flag
fix(skeleton:nestjs): pin @nestjs/core to v11.1.21
docs(workflow): clarify Phase 3 exit gate criteria
chore(deps): bump release-please-action from x to y
feat(stack:python)!: drop Python 3.10 support

BREAKING CHANGE: minimum Python is now 3.11.
```

The trailing `!` after the type/scope marks a breaking change in the subject line; the `BREAKING CHANGE:` footer is also required.

## Sign-off (DCO)

All commits must carry a `Signed-off-by` trailer (`git commit -s`). This is a Developer Certificate of Origin sign-off — it certifies that you have the right to submit the contribution under the project's MIT license. Pull requests without sign-off will be asked to re-commit with `-s`.

## Documentation expectations

If your change affects user-visible behavior, update the relevant docs **in the same PR**:

- A change to the bootstrap script → update the Quickstart in `README.md` and any affected `workflow/` or `standards/` page.
- A change to a stack profile or template → update `stacks/<name>.md` and the matching `project-templates/<lang>/<file>.md`.
- A behavior change in the reference example → update its phase docs under `examples/hello-todo-go/docs/`.

PRs that ship behavior changes without doc updates will be requested-changes by default. Reviewers are encouraged to point at the specific doc that needs updating rather than waving generally.

## Testing expectations

- Shell scripts: pass `shellcheck -x --shell=bash`.
- Markdown: pass `markdownlint-cli2`.
- The reference example: `./scripts/verify-example.sh` must pass.
- The skeletons you touched: `./scripts/selftest.sh --stacks <changed-stacks>` must pass.

Add new tests where it makes sense (especially for new Go code in the reference example).

## Release process (maintainer note)

Releases are automated by `release-please`. When commits land on `main`, the action keeps a "Release PR" open that drafts the next `CHANGELOG.md` and bumps `VERSION`. To ship a release: merge the Release PR. The action then tags the commit, drafts a GitHub release, and updates `CHANGELOG.md` and `VERSION`.

Manual tagging or direct CHANGELOG edits are not part of the normal flow.

## Reporting issues and gaps

- Bugs: open a `[bug]` issue using the bug-report template.
- Feature requests: open a `[feature]` issue using the feature-request template.
- Cases where the system itself failed to cover a real-world need: open a `[gap]` issue using the system-gap template. These are the highest-leverage reports for evolving the system.

## Security

Security issues follow a separate process documented in the repo's `SECURITY.md`. Do not open a public issue for a suspected vulnerability.

## License of contributions

By contributing, you agree that your contributions will be licensed under the project's MIT License (see the `LICENSE` file in the repo root).
