# hello-todo-react-native-expo

A minimal, offline-first todo app built with React Native and Expo. It serves as the canonical filled-in mobile reference project for the ai-engineering-system workflow — the first mobile-shaped example, deliberately diverging from the HTTP-server siblings (no `/v1/todos`, no port, no curl smoke test).

## Quickstart

```bash
make setup   # npm install
make test    # run all tests (jest-expo, no watch)
make run     # expo start (interactive)
```

After `make run`:
- Press `i` to open the iOS simulator
- Press `a` to open the Android emulator
- Press `w` to open in the browser
- Scan the QR code with Expo Go on your phone

## Features

- **Offline-first** — all state lives in AsyncStorage; closing and reopening the app retains your todos
- **No backend** — intentionally local-only, distinguishing this example from the backend siblings
- **Add, toggle, delete** — full CRUD on todos from a single home screen
- **Loading state** — ActivityIndicator during the initial AsyncStorage hydration
- **Empty state** — friendly prompt when the list is empty
- **Accessible** — checkbox, delete button, and list items carry `accessibilityLabel` and `accessibilityRole`

## Project layout

```
app/
  _layout.tsx            — Expo Router root layout (Stack)
  index.tsx              — list screen (home)
components/
  TodoList.tsx           — FlatList wrapper rendering TodoItem rows
  TodoItem.tsx           — single row: toggle checkbox + delete button
  AddTodoForm.tsx        — text input + Add button
  EmptyState.tsx         — shown when the list is empty
services/
  todos.ts               — pure functions: createTodo, listTodos, updateTodo, deleteTodo
  todos.test.ts          — unit tests for the service layer
lib/
  storage.ts             — load/save todo list to AsyncStorage
  storage.test.ts        — round-trip tests with mocked AsyncStorage
hooks/
  useTodos.ts            — hook wiring storage + service, exposes { todos, loading, add, toggle, remove }
types/
  todo.ts                — Todo interface, CreateTodoInput, ValidationError, validateCreateInput
__tests__/
  index.test.tsx         — integration render test for HomeScreen (add + delete flow)
```

## Makefile targets

| Target     | Description                                              |
|------------|----------------------------------------------------------|
| setup      | `npm install`                                            |
| run        | `expo start` (interactive dev server)                    |
| test       | `jest --watchAll=false`                                  |
| lint       | `eslint .`                                               |
| fmt        | configure Prettier in Phase 3                            |
| typecheck  | `tsc --noEmit`                                           |
| build      | alias for `typecheck` (Expo has no traditional build)    |

## Full workflow docs

See `docs/` for Phase 0–8 artifacts.

This example was bootstrapped from ai-engineering-system v0.4.0 and serves as the canonical filled-in mobile reference.
