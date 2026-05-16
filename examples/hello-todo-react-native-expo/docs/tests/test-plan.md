# test plan — hello-todo-react-native-expo v0.1.0

## scope

The two screens (list and add modal), the `useTodos` hook, the service layer, the
in-memory repo, and the AsyncStorage storage layer for the
`hello-todo-react-native-expo` application.

Out of scope: end-to-end device automation (Detox / Maestro), performance testing,
network integration tests (none exist in v0.1.0).

## test runner setup

All tests use Jest ^29.7.0 configured with the `jest-expo` preset (~55.0.17). The
jest-expo preset handles Metro's module resolver, React Native-specific globals, and
the `@testing-library/react-native` environment. AsyncStorage is mocked globally via
`@react-native-async-storage/async-storage/jest/async-storage-mock`.

---

## test layers

### unit — repo (`__tests__/repo.test.ts`)

Tests `lib/repo.ts` directly. Pure synchronous function calls; repo state is reset via
`lib/repo.setTodos([])` in `beforeEach`.

| test | covered behaviour |
|---|---|
| `addTodo appends and returns updated list` | happy path |
| `addTodo returns a copy — mutating result does not affect stored state` | copy isolation |
| `getTodos returns empty array when store is empty` | empty state |
| `getTodos preserves insertion order` | order guarantee |
| `updateTodo updates fields and bumps updated_at` | mutation + timestamp |
| `updateTodo returns undefined for unknown id` | not-found |
| `removeTodo removes item and returns updated list` | happy path |
| `removeTodo returns undefined for unknown id` | not-found |

### unit — storage (`__tests__/storage.test.ts`)

Tests `lib/storage.ts` with the official AsyncStorage jest mock.

| test | covered behaviour |
|---|---|
| `loadTodos returns empty array when key does not exist` | empty initial state |
| `loadTodos returns parsed todos after saveTodos` | round-trip |
| `loadTodos returns empty array when stored value is corrupted JSON` | graceful degradation |
| `saveTodos writes JSON array under correct key` | persistence |
| `clearTodos removes the key` | cleanup |

### unit — service (`__tests__/todos.service.test.ts`)

Tests `services/todos.ts` with real repo functions and mocked storage
(`jest.mock('../lib/storage')`). Resets repo state in `beforeEach`.

| test | covered behaviour |
|---|---|
| `createTodo creates a todo with trimmed title and completed=false` | trim + defaults |
| `createTodo throws validation_error for empty title` | US-004 |
| `createTodo throws validation_error for whitespace-only title` | US-004 |
| `createTodo throws validation_error for title over 200 chars` | US-004 |
| `createTodo accepts title of exactly 200 chars` | boundary |
| `createTodo saves to storage after creating` | persistence |
| `toggleTodo flips completed and bumps updated_at` | US-005 |
| `toggleTodo throws not_found for unknown id` | not-found |
| `toggleTodo saves to storage after toggling` | persistence |
| `deleteTodo removes the todo` | US-006 |
| `deleteTodo throws not_found for unknown id` | not-found |
| `deleteTodo saves to storage after deleting` | persistence |
| `init loads todos from storage into repo` | US-007 |
| `init sets repo to empty array when storage is empty` | empty initial state |

### unit — useTodos hook (`__tests__/useTodos.test.ts`)

Uses `renderHook` from `@testing-library/react-native`. Mocks `services/todos.ts` to
control async behavior.

| test | covered behaviour |
|---|---|
| `loading is true before init resolves` | loading state |
| `loading is false after init resolves` | ready state |
| `todos is populated from service init` | US-001, US-007 |
| `addTodo updates todos state` | US-003 |
| `toggleTodo updates todos state` | US-005 |
| `deleteTodo updates todos state` | US-006 |

### component — screens (`__tests__/screens.test.tsx`)

Renders `app/index.tsx` and `app/add.tsx` using RNTL's `render`. Mocks the `useTodos`
hook to inject controlled state. Uses `fireEvent` for interactions.

| test | covered behaviour |
|---|---|
| `list screen renders todo titles` | US-001 |
| `list screen renders empty state when todos is empty` | US-002 |
| `list screen renders ActivityIndicator while loading is true` | US-001 |
| `list screen renders completed item with strikethrough` | US-005 |
| `list screen calls toggleTodo when toggle is pressed` | US-005 |
| `list screen calls deleteTodo when delete is pressed` | US-006 |
| `add screen renders title input` | US-003 |
| `add screen shows validation error for empty title` | US-004 |
| `add screen shows validation error for whitespace-only title` | US-004 |
| `add screen shows validation error for title over 200 chars` | US-004 |
| `add screen calls addTodo and navigates back on valid title` | US-003 |
| `add screen does not call addTodo on invalid title` | US-004 |

### manual / exploratory

See `manual-test-checklist.md`. Run by a human before any release on each of the three
targets (iOS simulator, Android emulator, Web).

---

## coverage targets

| layer | target |
|---|---|
| repo | ≥ 90% statement coverage |
| storage | ≥ 90% statement coverage |
| service | ≥ 90% statement coverage |
| hook | all three mutation callbacks + loading state covered |
| screens | all user stories covered by at least one component test |

Run `npx jest --coverage` to measure.

## ci gate

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs `npx jest` and
`npx tsc --noEmit` on every push and pull request. The build must be green before merging.

## regression

See `regression-checklist.md` for the pre-release checklist.
