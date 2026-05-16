# active task

## goal

TODO-008 — test suite, lint config, and runbook

Complete the final task of milestone v0.1.0: write Jest tests using the jest-expo preset
and @testing-library/react-native, configure eslint-config-expo flat config, write the
runbook and known-issues doc, and add the CHANGELOG entry. Polish all phase docs for
consistency. Update workflow state to reflect milestone complete.

## status

`completed`

## affected services

- hello-todo-react-native-expo (the whole example)

## affected files

- `__tests__/`
- `eslint.config.js`
- `docs/maintenance/runbook.md`
- `docs/maintenance/known-issues.md`
- `CHANGELOG.md`
- `.ai/workflow/workflow-state.md`
- `.ai/workflow/active-task.md` (this file)

## acceptance criteria

- `npx jest` passes from a clean checkout
- `npx tsc --noEmit` exits zero (typecheck-as-build)
- `npx eslint .` exits zero on valid TypeScript
- runbook covers: start in Expo Go, start on iOS simulator, start on Android emulator,
  start on Web, reset AsyncStorage, interpret Metro logs
- known-issues documents local-only persistence, no cloud sync, no OTA configured in
  v0.1.0
- `CHANGELOG.md` has a `## [0.1.0] - 2026-05-16` entry listing offline-first persistence,
  two screens, jest-expo setup, eslint-config-expo flat config, and typecheck pipeline
- `workflow-state.md` current phase is Phase 8: Maintenance

## verification plan

- run `npx jest` locally; confirm all suites pass
- run `npx tsc --noEmit` and `npx eslint .`; confirm zero errors
- read runbook and verify every command is accurate against the installed Expo version

## notes

- jest-expo preset handles Metro module resolution and RN-specific mocks automatically
- @testing-library/react-native's `render` works in the jest-expo environment
- eslint-config-expo ships a flat-config entry point compatible with ESLint 9
- all eight tasks (TODO-001 through TODO-008) are now complete

## next

Milestone v0.1.0 complete. Transition to Phase 8 maintenance. Update
`.ai/workflow/workflow-state.md`. Consider v0.2.0 with cloud sync (parking-lot item in
`docs/plan/milestones.md`).
