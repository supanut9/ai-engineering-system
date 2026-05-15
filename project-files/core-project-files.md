# Core Project Files

## Purpose

This document defines the baseline files that most real software projects
should include, regardless of stack.

These files are about repository clarity, collaboration, onboarding, and
maintenance. They are not tied to a specific framework.

## Source Convention

This playbook follows:

- GitHub's repository and community file conventions for `README.md`,
  `CONTRIBUTING.md`, and related repository health files
- `Keep a Changelog` style for `CHANGELOG.md`

## Filename Casing Rule

Use the conventional filename style that tools and developers already expect.

### Uppercase filenames

Use uppercase for widely recognized repository root documents:

- `README.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `LICENSE`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `AGENTS.md`
- `CLAUDE.md`
- `GEMINI.md`

These are uppercase because that is the most common and recognizable
convention.

### Lowercase filenames

Use lowercase kebab-case for playbook documents and internal guidance files:

- `project-context.md`
- `workflow-state.md`
- `active-task.md`
- `go-gin-clean.md`
- `clean-architecture.md`

These are not universal repo-root conventions, so lowercase is cleaner and more
consistent.

### Dotfiles

Use dot-prefixed names when the ecosystem expects them:

- `.gitignore`
- `.env.example`
- `.editorconfig`
- `.prettierrc`
- `.nvmrc`

## Required For Every Project

- `README.md`
- `CHANGELOG.md`
- `.gitignore`

## Required For Team Projects

- `CONTRIBUTING.md`

## Required When Environment Variables Exist

- `.env.example`

## Required When The Project Is Shared Externally

- `LICENSE`

## Recommended For Most Non-Trivial Projects

- `AGENTS.md` or the tool-specific equivalent
- project workflow state files under `.ai/workflow/`
- architecture and planning docs under `docs/`
- `SECURITY.md` for repositories that handle real user data, credentials, or
  production systems

## Optional But Useful

- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `Makefile`
- `docker-compose.yml`
- `.tool-versions`

## Decision Rules

### `README.md`

Always include it.

It should explain:

- what the project is
- how to start it
- how to test it
- where important docs live

GitHub convention:

- place `README.md` in the repository root when possible
- use clear section headings because GitHub renders a table of contents from
  headings

### `CHANGELOG.md`

Include for every real project.

It should track:

- meaningful releases
- notable internal milestones if the project is not yet public

Format rule:

- use `Keep a Changelog` structure
- keep an `Unreleased` section at the top
- group entries under headings like `Added`, `Changed`, `Fixed`, and `Removed`

### `CONTRIBUTING.md`

Include when more than one person or agent is expected to work in the repo.

It should explain:

- branch and commit expectations
- test and lint expectations
- documentation update expectations

GitHub convention:

- place `CONTRIBUTING.md` in the repository root, `.github/`, or `docs/`
- prefer repository root for project-local clarity unless your organization uses
  a central `.github` repository for default community files

### `.gitignore`

Always include it.

It should be stack-specific and generated from the actual tools used in the
repo.

### `.env.example`

Include whenever runtime configuration depends on environment variables.

It should list:

- required keys
- optional keys
- safe placeholder values only

Never include secrets.

### `LICENSE`

Include when the project will be distributed, published, or shared outside the
immediate team.

## How To Use In This Playbook

Every project blueprint should reference this file and state which of these
repo files are required for that project.
