# Security Policy

Thank you for taking the time to investigate the security of this project. This document describes how to report a vulnerability and what to expect in response.

## Supported versions

This project is pre-1.0. Security fixes are best-effort and target the latest minor release only. Older minor versions will not receive backported patches; users are expected to upgrade.

| Version | Supported          |
|---------|--------------------|
| 0.x     | Latest minor only  |
| < 0.x   | Not supported      |

Once the project reaches 1.0, this table will be updated to reflect a clear long-term support window.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for a suspected vulnerability.

Preferred reporting channels, in order:

1. **GitHub private vulnerability reporting** (once the repository is public): use the "Report a vulnerability" link under the repository's Security tab.
2. **Email**: send a report to **supanut.tan@ondemand.in.th** with the subject line prefixed `[SECURITY]`.

Include in your report:

- A description of the issue and the impact you observed or believe is possible.
- Steps to reproduce, ideally as a minimal example.
- The version of the project (see `VERSION` at the repo root).
- Your environment (OS, shell, Go and Node versions where relevant).
- Whether the issue is currently public anywhere else.

## What to expect

- **Acknowledgement** within 72 hours of receiving the report.
- **Initial assessment** within 7 days, including a severity classification.
- **Fix timelines** (target):
  - Critical: a fix or mitigation released within 7 days.
  - High: within 30 days.
  - Medium and low: best-effort, addressed in the next scheduled release.
- A coordinated **public disclosure** once the fix has been released and users have had reasonable time to update.

## Disclosure policy

We follow coordinated disclosure. We will not discuss the vulnerability publicly until a fix is shipped and announced. Reporters are credited in the release notes unless they request to remain anonymous.

## Scope

In scope:

- Anything under this repository: scripts (`scripts/`), templates (`templates/`), adapter configs (`claude/`, `codex/`), documentation, and the reference example (`examples/`).

Out of scope:

- Downstream projects that adopt this system. They have their own security posture and their own `SECURITY.md`.
- The third-party libraries pulled into bootstrapped projects (Gin, NestJS, Next.js, etc.) — please report vulnerabilities in those to their respective upstream projects.
- Issues that require a malicious local actor or a previously compromised host.

Thank you for helping keep the project and its users safe.
