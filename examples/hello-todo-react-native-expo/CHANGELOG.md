# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_Bootstrapped from the ai-engineering-system example scaffold on 2026-05-16._

## [0.1.0] - 2026-05-16

### Added

- Initial release of hello-todo-react-native-expo.
- Offline-first persistence via `@react-native-async-storage/async-storage`; todos
  survive app restart and backgrounding, stored under the `@hello_todo:todos` key.
- Two screens via Expo Router file-system routing: `app/index.tsx` (list screen) and
  `app/add.tsx` (modal add screen).
- List screen: renders all todos with completion state, empty-state message when the list
  is empty, and an ActivityIndicator while AsyncStorage is loading on mount.
- Add modal: controlled title input with auto-focus, inline validation (empty title,
  whitespace-only title, title exceeding 200 characters), and dismiss-on-success via
  `router.back()`.
- Toggle completion and delete controls on each todo item; both interactions persist
  changes to AsyncStorage before updating React state.
- Layered architecture: screens → `hooks/useTodos.ts` → `services/todos.ts` →
  `lib/repo.ts` (in-memory) + `lib/storage.ts` (AsyncStorage I/O).
- Jest test suite using the `jest-expo` preset (~55.0.17) and
  `@testing-library/react-native` ^13.3.3; covers repo, storage, service, hook, and
  screen layers.
- ESLint flat config (`eslint.config.js`) via `eslint-config-expo` ~55.0.1; pinned to
  ESLint ^9.39.0 pending ESLint 10 support in upstream plugins.
- Typecheck-as-build pipeline: `npx tsc --noEmit` serves as the CI build gate in the
  absence of a server compilation step.
- Phase 0–8 documentation artifacts under `docs/`; includes `docs/specs/screens.md`
  (screen-level wireframes) and `docs/specs/data-contract.md` (AsyncStorage schema) in
  place of the `api-spec.md` present in backend examples.
- EAS Build and EAS Submit deployment path documented in `docs/release/deployment-plan.md`;
  OTA rollback and store rollback procedures documented in `docs/release/rollback-plan.md`.

[Unreleased]: https://github.com/example/hello-todo-react-native-expo/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/example/hello-todo-react-native-expo/releases/tag/v0.1.0
