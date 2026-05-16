# system design — hello-todo-react-native-expo

References: `../requirements/prd.md` (success criteria), `../specs/functional-spec.md`
(behavioral contract), `decisions/0001-expo-router-asyncstorage.md` (architectural choice).

---

## context

`hello-todo-react-native-expo` is a single-process React Native application built with
Expo (managed workflow) and Expo Router that stores todo items locally in AsyncStorage.
Its primary purpose is to be a readable, self-contained mobile reference example;
simplicity is a first-class constraint alongside correctness. There are no network
dependencies at runtime (no API, no backend, no queue). Everything the app needs is on
the device.

---

## layered architecture overview

```
                ┌──────────────────────────────────────────┐
                │          React Native runtime             │
                │      (Hermes / V8 via Expo managed)       │
                └──────────┬───────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
   ┌──────────▼──────────┐   ┌──────────▼──────────┐
   │   Screens (Expo     │   │   Screens (Expo      │
   │   Router)           │   │   Router)            │
   │   app/index.tsx     │   │   app/add.tsx        │
   │   (list)            │   │   (modal add)        │
   └──────────┬──────────┘   └──────────┬──────────┘
              │                         │
              └────────────┬────────────┘
                           │
                ┌──────────▼──────────┐
                │   Hook              │
                │   hooks/useTodos.ts │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │   Services          │
                │   services/todos.ts │
                └──────────┬──────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
   ┌──────────▼──────────┐   ┌──────────▼──────────┐
   │   In-memory Repo    │   │   Storage            │
   │   lib/repo.ts       │   │   lib/storage.ts     │
   │   (Todo[])          │   │   (AsyncStorage I/O) │
   └─────────────────────┘   └─────────────────────┘
```

The layering is **screens → hooks → services → lib**. This is the mobile analog of the
backend's **routes → service → repo** pattern documented in
`code-architectures/layered.md`.

---

## components

### app/_layout.tsx — root stack layout

Wraps the app with a `Stack` navigator from Expo Router. Declares both routes: `index`
(list, always in stack) and `add` (modal). Applies `SafeAreaProvider`. No data fetching.

### app/index.tsx — list screen

Consumes the `useTodos` hook. Renders a `FlatList` (or `ScrollView`) of `TodoItem`
components when todos exist, or the empty-state message otherwise. Shows a loading
indicator while AsyncStorage is being read on mount. Provides the navigation trigger to
the add modal. Passes `onToggle` and `onDelete` callbacks down to `TodoList` and
`TodoItem`.

### app/add.tsx — add modal

Controlled text input for the todo title. Runs client-side validation (trim, non-empty,
≤ 200 chars) before calling the `useTodos().addTodo` callback. Displays inline error
messages. On success, calls `router.back()` to dismiss the modal. Cancel button (or
swipe-down gesture) also calls `router.back()` without mutating state.

### components/ — presentational components

- `TodoList` — renders a `FlatList` of `TodoItem`s; receives the `todos` array and
  callbacks.
- `TodoItem` — renders one row: toggle control, title, delete control. Applies
  strikethrough style when `completed` is true.
- Supporting small components as needed (e.g., an `AddButton`).

### hooks/useTodos.ts — state + orchestration hook

Bridges the screens and the service layer. On first render, calls
`services/todos.init()` (which calls `lib/storage.loadTodos()` and seeds the repo).
Exposes `{ todos, loading, addTodo, toggleTodo, deleteTodo }`. All mutation callbacks
call the corresponding service function, then update local React state with the returned
todo array. No `useEffect` is needed for mutations — state is updated synchronously in
the callback after the `await` resolves.

### services/todos.ts — service (business logic)

Pure exported async functions. Input validation (trim, non-empty, ≤ 200 chars), id
generation, timestamp management, and delegation to `lib/repo` and `lib/storage`. Throws
typed errors (`not_found`, `validation_error`) for invalid operations. Does not import
React.

### lib/repo.ts — in-memory repository

Module-level `Todo[]` array. Exported functions: `setTodos`, `getTodos`, `addTodo`,
`updateTodo`, `removeTodo`. All reads return copies (spread or `[...arr]`) to prevent
callers from mutating internal state. This module has no I/O; it is a synchronous
in-memory structure.

### lib/storage.ts — AsyncStorage I/O

Thin wrapper around `@react-native-async-storage/async-storage`. Exports:
`loadTodos(): Promise<Todo[]>`, `saveTodos(todos: Todo[]): Promise<void>`,
`clearTodos(): Promise<void>`. JSON serialization and error handling live here.

### types/todo.ts — shared types

Exports the `Todo` TypeScript interface and, optionally, a hand-rolled `isTodo` guard
function. No runtime code beyond the guard.

---

## data flow

```
Mount:
  useTodos useEffect → services.init()
    → lib/storage.loadTodos()    (AsyncStorage.getItem)
    → lib/repo.setTodos(loaded)
    → returns Todo[]
    → useTodos sets state { todos, loading: false }
    → screens render

Add todo:
  add screen submit → useTodos.addTodo(title)
    → services.createTodo({ title })  (validate, generate id + timestamps)
      → lib/repo.addTodo(todo)        (append in-memory)
      → lib/storage.saveTodos(all)    (AsyncStorage.setItem)
      → return updated Todo[]
    → useTodos sets state { todos: updated }
    → list screen re-renders
    → router.back() dismisses modal

Toggle / Delete:
  list screen callback → useTodos.toggleTodo(id) / deleteTodo(id)
    → services.toggleTodo / deleteTodo
      → lib/repo.updateTodo / removeTodo
      → lib/storage.saveTodos(all)
      → return updated Todo[]
    → useTodos sets state { todos: updated }
    → list screen re-renders
```

---

## key tradeoffs

| tradeoff | choice | rationale |
|---|---|---|
| simplicity vs persistence | AsyncStorage (local only) | keeps the example self-contained; no backend needed; persistence survives restart |
| Expo Router vs React Navigation manual | Expo Router | file-system routing; less boilerplate; see ADR-0001 |
| thin hook + service vs Redux/Zustand | thin useTodos hook | no extra store dependency; demonstrates the pattern without framework overhead; see ADR-0001 |
| single AsyncStorage key vs per-item keys | single key (array) | atomic read/write; simpler for one entity at small scale |
| AsyncStorage vs SQLite/MMKV | AsyncStorage | fits the example's data; zero native config; managed workflow compatible; see ADR-0001 |
| manual validation vs library | manual (trim + length) | one entity with two constrained fields does not justify a runtime dependency |

---

## deployment shape

No server process. The app runs as a native binary (or web bundle) on the user's device.
Development entry point:

```bash
npx expo start
```

Production builds are produced by EAS (`eas build`). See `docs/release/deployment-plan.md`
for the full EAS + store submission path.

---

## observability

- **development:** Metro logs all JS errors and warnings to the terminal. Expo Go surfaces
  the red error screen with a stack trace.
- **production:** No crash reporting configured in v0.1.0. Future: Sentry or Expo
  Crashlytics integration (noted in `known-issues.md`).
- **debugging AsyncStorage:** Use Expo DevTools or the React Native Debugger's
  AsyncStorage inspector. No admin endpoint exists.
