# project context

> **About this example:** This file is the canonical filled-in project-context for the
> ai-engineering-system reference example (`hello-todo-react-native-expo`). Do not use
> this directory as a production starter; it exists to demonstrate what a complete
> project-context looks like after Phase 0 intake for a mobile-shaped project with no
> HTTP API surface.

## project name

hello-todo-react-native-expo

## product type

Mobile application (React Native / Expo) — internal example / learning reference

## system version

v0.0.1

## date initialized

2026-05-16

## owner

Example Maintainer <maintainer@example.com>

## agent

claude

## current phase

Phase 8: Maintenance

## selected stack

- language: TypeScript 6.0.3
- runtime: React Native 0.85.3 (Hermes JS engine on iOS/Android; V8 on Web via Metro)
- framework: Expo ~55.0.24 with Expo Router ~55.0.14
- persistence: @react-native-async-storage/async-storage (managed workflow, no native config)
- state: thin in-memory repo in `lib/repo.ts` + load-on-mount / save-on-mutate pattern in `hooks/useTodos.ts`
- testing: Jest ^29.7.0 with jest-expo ~55.0.17 preset + @testing-library/react-native ^13.3.3
- bundler: Metro (default for Expo)
- lint: eslint ^9.39.0 + eslint-config-expo ~55.0.1

## architecture

expo-router-layered (screens → hooks → services + lib)

## relevant shared workflow files

- `workflow/ai-workflow.md`
- `workflow/agent-protocol.md`
- `workflow/phase-gates.md`
- `workflow/task-lifecycle.md`

## relevant stack profiles

- `stacks/expo.md` (when available)

## relevant architecture reference

- `code-architectures/layered.md`

## relevant standards

- `standards/coding-standards.md`
- `standards/testing-standards.md`
- `standards/git-workflow.md`

## current goal

Maintenance of v0.1.0. Monitor for Expo SDK and React Native updates; address known
limitations documented in `docs/maintenance/known-issues.md`.

## current constraints

- persistence is local-only (AsyncStorage on the device); no cloud sync
- no authentication; no user model
- single-tenant; no multi-device sync
- no production deploy — the example documents the EAS build / store-submit path but
  does not execute it; local Expo Go / development build is the intended target

## agent instructions

- follow the shared workflow in order
- do not skip phase gates
- do not implement before required planning artifacts exist
- when adding features, start a new Phase 0 intake for the change
- this example must stay generic; do not introduce monorepo-specific patterns
- there is no HTTP API surface — do not add `api-spec.md`; persist data via AsyncStorage
