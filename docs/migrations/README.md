# migrations

This directory is the index of migration guides for the AI Engineering System. Each page covers one version-to-version transition and tells downstream projects what action, if any, they need to take.

## naming convention

Files follow the pattern `<from>-to-<to>.md`.

Examples:
- `0.0-to-0.1.md` — initial baseline to the first tagged release; mostly informational
- `0.1-to-0.2.md` — first release to second
- `0.x-to-1.0.md` — the 1.0 stabilization migration; expected to be substantial

## when a migration page is required

A migration page must exist before the releasing version ships if any of the following are true:

- a downstream project must take action (rename a file, update an environment variable, change a script argument) to stay compatible;
- a deprecated artifact is being removed;
- the workflow phases changed or required files changed.

If any of these apply, the migration page is a release blocker. The releasing PR must include or link to the migration page.

## when a migration page is optional but encouraged

Write a migration page when:

- a new stack profile or optional standard is available and adoption is worth flagging;
- a behavior change is backwards-compatible but subtle enough to confuse existing users.

Cosmetic improvements — doc polish, more example coverage, typo fixes — do not need a migration page. A CHANGELOG entry is sufficient.

## available guides

| From | To | Notes |
|------|----|-------|
| `0.0` | `0.1` | [`0.0-to-0.1.md`](0.0-to-0.1.md) — initial adoption; scaffold pending v0.1.0 release |

## see also

- [Governance](../governance.md) — release model and deprecation policy
- [Changelog](../changelog.md) — per-version summary of what changed
