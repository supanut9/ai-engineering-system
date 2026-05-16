# implementation plan — hello-todo-react-native-expo

## scope

Implement the two screens (list and modal add), offline-first AsyncStorage persistence,
and supporting infrastructure described in `../requirements/prd.md` (FR-01 through FR-06)
as a React Native / Expo app using the Expo Router layered architecture specified in
`../architecture/system-design.md`.

All acceptance criteria are in `../requirements/acceptance-criteria.md`. All tasks are
listed in `tasks.md`.

---

## milestones overview

| milestone | description | target |
|---|---|---|
| v0.1.0 | first runnable todo app with list screen, add modal, AsyncStorage persistence, and passing tests | 2026-05-16 |

Details in `milestones.md`.

---

## sequencing

Tasks are sequenced inside-out: shared types and repo first, then storage and service,
then the hook, then screens and components, then tests and tooling. This order ensures
each layer can be tested in isolation before the layer above it is built.

```
TODO-001  project scaffolding (Expo app skeleton, directory structure)
    └─ TODO-002  types, repo, and storage (Todo interface, lib/repo.ts, lib/storage.ts)
           └─ TODO-003  service (services/todos.ts — business logic, validation)
                  └─ TODO-004  useTodos hook (hooks/useTodos.ts — state orchestration)
                         └─ TODO-005  screens and components
                                       (app/_layout.tsx, app/index.tsx, app/add.tsx,
                                        components/)
                                └─ TODO-006  validation and error handling
                                       (inline on add screen + service guards)
                                       └─ TODO-007  unit and component tests
                                              └─ TODO-008  lint config and runbook
```

---

## dependencies

| dependency | type | status |
|---|---|---|
| expo ~55.0.24 | framework | `npx expo install` on first setup |
| expo-router ~55.0.14 | navigation | `npx expo install` |
| react 19.2.6 | peer dependency | `npx expo install` |
| react-native 0.85.3 | peer dependency | `npx expo install` |
| react-native-safe-area-context 5.7.0 | peer dependency | `npx expo install` |
| react-native-screens 4.25.0 | peer dependency | `npx expo install` |
| @react-native-async-storage/async-storage | persistence | `npx expo install` |
| expo-status-bar ~55.0.6 | UI | `npx expo install` |
| jest ^29.7.0 | testing | `npm install --save-dev` |
| jest-expo ~55.0.17 | jest preset | `npm install --save-dev` |
| @testing-library/react-native ^13.3.3 | component testing | `npm install --save-dev` |
| typescript 6.0.3 | language | `npm install --save-dev` |
| eslint ^9.39.0 | lint | `npm install --save-dev` |
| eslint-config-expo ~55.0.1 | lint config | `npm install --save-dev` |

No database, no network, no backend process required.

---

## test strategy

| layer | approach | tool |
|---|---|---|
| repo | unit tests covering all CRUD functions; reset `lib/repo` state in `beforeEach` | Jest + jest-expo |
| storage | unit tests with mocked AsyncStorage; verify serialize/deserialize round-trip | Jest + jest-expo + async-storage mock |
| service | unit tests with real repo functions and mocked storage; verify validation and error propagation | Jest + jest-expo |
| useTodos hook | hook-level tests using `renderHook` from @testing-library/react-native | Jest + jest-expo + RNTL |
| screens | component tests rendering screens with RNTL; assert rendered text and interactions | Jest + jest-expo + RNTL |

All tests must pass with `npx jest` from the repo root. Coverage target: all acceptance
criteria from `../requirements/acceptance-criteria.md` have at least one corresponding
test case.
