# tech stack — hello-todo-react-native-expo

| layer | choice | version | notes |
|---|---|---|---|
| language | TypeScript | 6.0.3 | latest stable as of 2026-05-16; Expo 55 ships with TS 6 support |
| framework | Expo (managed workflow) | ~55.0.24 | SDK 55; managed workflow means no ejected native code in v0.1.0 |
| navigation | Expo Router | ~55.0.14 | file-system routing built on React Navigation 7; ships with Expo SDK 55 |
| status bar | expo-status-bar | ~55.0.6 | cross-platform status bar control; included with Expo |
| UI runtime | React Native | 0.85.3 | peer dependency of Expo SDK 55 |
| react | React | 19.2.6 | peer dependency of React Native 0.85; hooks-based component model |
| safe area | react-native-safe-area-context | 5.7.0 | inset handling for notches and home indicators; required by Expo Router |
| screens | react-native-screens | 4.25.0 | native screen containers; required by Expo Router / React Navigation |
| persistence | @react-native-async-storage/async-storage | latest | key-value on-device storage; managed workflow compatible; no native linking required |
| bundler | Metro | default (Expo) | configured by `expo` package; no separate `metro.config.js` required for v0.1.0 |
| unit / component testing | Jest | ^29.7.0 | test runner; configured via `jest-expo` preset |
| expo jest preset | jest-expo | ~55.0.17 | Metro-aware Jest transform and module resolver; required for testing Expo apps |
| component testing | @testing-library/react-native | ^13.3.3 | renders RN components in Jest; replaces enzyme |
| lint | ESLint | ^9.39.0 | held at ESLint 9; `eslint-plugin-react` upstream is not ESLint 10-ready via `eslint-config-expo` |
| expo lint config | eslint-config-expo | ~55.0.1 | flat config (ESLint 9 compatible); covers React, React Native, TypeScript rules |

---

## notes

### no API layer

There is no HTTP framework, no route handler, no port binding. The entire runtime is the
React Native JS engine (Hermes on iOS/Android, V8 on Web) talking to device APIs. This is
the fundamental difference from every other example in the system.

### validation approach

Validation is performed manually in `services/todos.ts`. Input constraints (non-empty
title after trim, max 200 chars) are checked with small guard functions. A reference
example with one entity and two constrained fields does not justify a runtime dependency
on Zod or Valibot. A real production app would likely adopt one of those here.

### no DI container

React Native / Expo does not ship a DI container. `hooks/useTodos.ts` imports
`services/todos.ts` directly as a module import. Testing stubs the storage layer by
replacing `lib/storage.ts`'s AsyncStorage with an in-memory mock via Jest's module mock
system.

### AsyncStorage in tests

`@react-native-async-storage/async-storage` ships an official mock at
`@react-native-async-storage/async-storage/jest/async-storage-mock`. The jest-expo
preset does not auto-install it; tests set it up manually in the Jest config or per-file
via `jest.mock(...)`.

### eslint ESLint 9 hold

ESLint is pinned to `^9.39.0` because `eslint-plugin-react` (a transitive peer of
`eslint-config-expo`) has not declared ESLint 10 compatibility as of SDK 55. When the
upstream plugins catch up, ESLint can be bumped in the same PR as `eslint-config-expo`.

### typecheck-as-build

There is no `next build` or `tsc --build` output artifact. The equivalent pipeline gate
is `npx tsc --noEmit`, which confirms type correctness without producing an output tree.
EAS handles the actual native compilation outside the local repo.

### future additions (out of scope for v0.1.0)

| capability | candidate | when |
|---|---|---|
| cloud sync | Supabase or a custom REST backend | v0.2.0 |
| crash reporting | Sentry for Expo or `expo-application` + Crashlytics | when shipped to production |
| OTA updates | `expo-updates` | when EAS production build is wired up |
| edit in-place | inline `TextInput` on `TodoItem` | v0.2.0 |
| due dates / priorities | service + data model extension | v0.2.0 |
| dark mode | React Native appearance API + theme context | v0.2.0 |
| EAS CI/CD | `eas.json` + GitHub Actions EAS workflow | before store submission |
