# tasks — hello-todo-react-native-expo

Tasks are sequenced inside-out. See `implementation-plan.md` for the dependency graph and
test strategy. Acceptance criteria are in `../requirements/acceptance-criteria.md`.

---

## TODO-001: project scaffolding

**description:** Create the Expo application skeleton using `npx create-expo-app` or by
hand. Set up directory layout: `app/`, `components/`, `services/`, `lib/`, `hooks/`,
`types/`, `__tests__/`. Add `tsconfig.json`, `app.json`, `babel.config.js`,
`jest.config.js`, `eslint.config.js`, `.gitignore`. Ensure `npx tsc --noEmit` compiles
without errors on the empty skeleton.

**depends on:** nothing

**acceptance criteria:**
- `app/_layout.tsx` and `app/index.tsx` exist
- `services/`, `lib/`, `hooks/`, `types/`, `__tests__/` directories exist
- `npx tsc --noEmit` passes on the empty skeleton
- `npx expo start` launches without Metro errors

**test approach:** compile check only at this stage

**complexity:** small

---

## TODO-002: types, repo, and storage

**description:** Define the `Todo` TypeScript interface in `types/todo.ts`. Implement
`lib/repo.ts` as a module-level `Todo[]` singleton. Implement exported pure functions:
`setTodos`, `getTodos`, `addTodo`, `updateTodo`, `removeTodo`. All read functions must
return copies to prevent callers from mutating internal state. Implement `lib/storage.ts`
as a thin AsyncStorage wrapper with `loadTodos`, `saveTodos`, and `clearTodos`. Handle
JSON parse errors gracefully in `loadTodos` (return `[]` and log).

**depends on:** TODO-001

**acceptance criteria:**
- `Todo` interface has fields: `id`, `title`, `completed`, `created_at`, `updated_at`
- `addTodo` appends and returns updated copy; `removeTodo` returns `undefined` for unknown id
- `updateTodo` bumps `updated_at`; returns `undefined` for unknown id
- `storage.loadTodos()` returns `[]` when AsyncStorage has no data
- `storage.loadTodos()` returns `[]` (not a crash) when stored JSON is corrupted
- `storage.saveTodos(todos)` writes the array as JSON under `@hello_todo:todos`
- package compiles with `npx tsc --noEmit`

**test approach:** unit tests in `__tests__/repo.test.ts` and `__tests__/storage.test.ts`;
mock AsyncStorage with the official jest mock

**complexity:** small

---

## TODO-003: service (business logic)

**description:** Implement `services/todos.ts` as a module of pure exported async
functions. Functions: `init()` (load from storage into repo), `createTodo({ title })`,
`toggleTodo(id)`, `deleteTodo(id)`. Business logic: trim title on create, validate
non-empty and ≤ 200 chars, generate id, set timestamps. Throw errors with a `code`
property (`'not_found'`, `'validation_error'`) when repo returns `undefined` or validation
fails. Each mutating function calls `lib/storage.saveTodos` after updating the repo.

**depends on:** TODO-002

**acceptance criteria (links to user stories):**
- title trimming and re-validation on create (US-003, US-004)
- `completed` defaults to `false` (US-003)
- `updated_at` changes on toggle (US-005)
- coded errors thrown for unknown ids (US-006 delete, US-005 toggle on missing id)
- coded errors thrown for invalid title (US-004)
- `init()` hydrates repo from AsyncStorage without throwing on empty storage

**test approach:** unit tests in `__tests__/todos.service.test.ts` using real repo
functions; mock `lib/storage.ts`; reset repo state in `beforeEach`

**complexity:** medium

---

## TODO-004: useTodos hook

**description:** Implement `hooks/useTodos.ts` as a custom React hook. On mount, calls
`services.init()` and sets `loading: false` when resolved. Exposes
`{ todos, loading, addTodo, toggleTodo, deleteTodo }`. Each callback calls the
corresponding service function, then updates React state with the returned `Todo[]`. The
hook is the single source of truth for todo state in the screen layer.

**depends on:** TODO-003

**acceptance criteria:**
- `loading` is `true` until `services.init()` resolves
- `addTodo(title)` calls `services.createTodo`, updates `todos` state (US-003)
- `toggleTodo(id)` calls `services.toggleTodo`, updates `todos` state (US-005)
- `deleteTodo(id)` calls `services.deleteTodo`, updates `todos` state (US-006)
- all three callbacks update `todos` without requiring a page reload
- hook re-exposes `loading` so screens can show a loading indicator (US-001)

**test approach:** `renderHook` tests in `__tests__/useTodos.test.ts` using RNTL;
mock service layer or run with real service + mocked storage

**complexity:** medium

---

## TODO-005: screens and components

**description:** Implement `app/_layout.tsx` (Stack with index + add modal routes),
`app/index.tsx` (list screen consuming `useTodos`), and `app/add.tsx` (add modal with
controlled input). Implement `components/TodoList.tsx` and `components/TodoItem.tsx`.
Apply `SafeAreaProvider` in the root layout. Use `router.push('/add')` to navigate to the
add screen and `router.back()` to dismiss it.

**depends on:** TODO-004

**acceptance criteria (links to user stories):**
- list screen renders todos when hook returns data (US-001)
- list screen renders "No todos yet" when `todos.length === 0` (US-002)
- list screen shows `ActivityIndicator` while `loading` is true (US-001)
- completed items have visible differentiation (US-005)
- add button navigates to the modal (US-003)
- add screen has a title input and a submit button (US-003)
- cancel / back dismisses the modal without creating a todo (US-003)

**test approach:** component tests in `__tests__/screens.test.tsx` rendering
`<index />` and `<AddScreen />` with RNTL; mock the `useTodos` hook return value

**complexity:** medium

---

## TODO-006: validation and error handling

**description:** Wire up client-side validation in `app/add.tsx`: trim the title on
submit, check non-empty and ≤ 200 chars, display the correct inline error message, and
prevent submission. Ensure service-level errors (`validation_error`, `not_found`) are
caught in the hook and do not crash the app. Log service errors to the console.

**depends on:** TODO-005

**acceptance criteria:**
- empty title shows "Title is required" inline; modal stays open (US-004)
- whitespace-only title shows same error (US-004)
- title > 200 chars shows "Title must be 200 characters or fewer" inline (US-004)
- error message is not visible when the form is clean
- catching a service error in the hook logs to console and does not call `router.back()`
  on the add screen

**test approach:** error behavior exercised by add-screen component tests (TODO-005 extended)

**complexity:** small

---

## TODO-007: unit and component tests

**description:** Write comprehensive tests covering all acceptance criteria. Include: repo
unit tests, storage unit tests, service unit tests, hook tests, and screen component
tests. Total: 25+ tests covering every user story from US-001 through US-008.

**depends on:** TODO-006

**acceptance criteria:**
- `npx jest` passes with zero failures
- each user story (US-001 through US-008) has at least one corresponding test case
- repo tests cover: addTodo, removeTodo copy isolation, updateTodo bumps updated_at
- storage tests cover: loadTodos empty, loadTodos corrupted JSON, saveTodos round-trip
- service tests cover: createTodo validation, toggleTodo not-found, deleteTodo not-found
- hook tests cover: loading state, addTodo updates list, toggleTodo, deleteTodo
- screen tests cover: list renders todos, empty state, add screen inline errors

**test approach:** Jest + jest-expo + @testing-library/react-native

**complexity:** medium

---

## TODO-008: lint config and runbook

**description:** Write `eslint.config.js` using the `eslint-config-expo` flat config.
Write `docs/maintenance/runbook.md` and `docs/maintenance/known-issues.md`. Write
`CHANGELOG.md` with `0.1.0` entry. Update workflow state to Phase 8: Maintenance.

**depends on:** TODO-007

**acceptance criteria:**
- `npx eslint .` exits zero with no errors on valid TypeScript
- `npx tsc --noEmit` exits zero
- `npx jest` passes
- runbook covers: start in Expo Go, iOS simulator, Android emulator, Web; reset
  AsyncStorage; interpret Metro error logs
- known-issues documents local-only persistence, no cloud sync, no OTA in v0.1.0
- `CHANGELOG.md` has `## [0.1.0] - 2026-05-16` entry

**test approach:** run all commands locally before committing

**complexity:** small
