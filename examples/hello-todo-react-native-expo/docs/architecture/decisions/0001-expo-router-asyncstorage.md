# ADR 0001: use Expo Router, AsyncStorage, and a thin in-memory repo pattern

## status

Accepted
Date: 2026-05-16

## context

Problem:
- The ai-engineering-system needs a React Native reference example that demonstrates the
  8-phase workflow for a real mobile application and serves as a counterpart to
  `hello-todo-nextjs` and `hello-todo-nestjs`.
- The example must be small enough to read in full, but architecturally clear enough to
  teach meaningful Expo / React Native patterns: file-system routing, offline-first
  persistence, and a layered state architecture without a heavyweight store library.
- Unlike every other example in the system, this one has no HTTP API surface. There is no
  `api-spec.md`, no port, no curl command. The data model lives entirely on the device.

Constraints:
- The app must run on iOS, Android, and Web via the Expo managed workflow with no ejected
  native code.
- It must exercise the layered architecture pattern documented in
  `code-architectures/layered.md` — adapted to the mobile idiom where the "transport
  layer" is React screens and the "persistence layer" is AsyncStorage.
- Implementation must complete in one focused developer-day.

Forces at play:
- Simplicity: fewer moving parts means the architecture is easier to see.
- Teaching value: the example should show Expo Router's file-system routing, AsyncStorage
  persistence, and a thin hook-based state pattern working together in a practical layered
  structure.
- Idiomatic Expo: the managed workflow with `expo-router` and `@react-native-async-storage`
  is the current Expo recommended path; it requires no native config changes.
- Dependency minimalism: no state management library, no ORM, no backend reduces noise.
- Alignment with other examples: using file-system routing (Expo Router) creates a mental
  model overlap with Next.js App Router — both use directory/file structure to define
  routes. This makes it easier for a developer who has read `hello-todo-nextjs` to follow
  this example.

## decision

Three coupled architectural choices are made together:

### choice 1: Expo Router over React Navigation manual setup

Use Expo Router (~55.0.14) as the navigation layer, configured via the `app/` directory
and `app/_layout.tsx` root layout.

Rationale:
- File-system routing matches the rest of the ai-engineering-system's documentation style
  (file paths are canonical, not configuration).
- Expo Router is the default in every new Expo SDK 50+ project; teaching it is the right
  default.
- It reduces boilerplate significantly compared to a manually-configured
  `NavigationContainer` + `createNativeStackNavigator` setup in React Navigation.
- The mental model — `app/index.tsx` is the root route, `app/add.tsx` is a sibling route
  presented as a modal — converges with Next.js App Router, making the layering contrast
  between mobile and web easier to articulate.
- The two-screen scope of this example (list + modal add) is well within Expo Router's
  sweet spot; there is no need for tab navigators, drawers, or nested stacks in v0.1.0.

### choice 2: AsyncStorage over SQLite / MMKV

Use `@react-native-async-storage/async-storage` as the on-device persistence layer,
accessed via a thin `lib/storage.ts` wrapper.

Rationale:
- The example's data fits comfortably in a single JSON-serialized array. AsyncStorage's
  practical limit for a mobile todo list is nowhere near the threshold where SQLite or
  MMKV would be needed.
- AsyncStorage is part of the Expo managed workflow with zero native configuration. There
  is no need to run `npx expo install @react-native-async-storage/async-storage` and then
  also run `npx pod-install` or modify `android/build.gradle`; the managed workflow
  handles linking automatically.
- A `lib/storage.ts` wrapper with a single `@hello_todo:todos` key is conceptually simple
  enough to read in 30 seconds. Swapping it for SQLite in a future version requires
  changing only `lib/storage.ts` — the service and hook layers are unaffected.
- SQLite would introduce a query language and schema migration concern that adds noise
  without teaching value for a one-entity reference. MMKV, while faster, is not part of
  the managed workflow without a config plugin.

### choice 3: thin in-memory repo + load-on-mount / save-on-mutate pattern over Redux/Zustand

Use a module-level `Todo[]` array in `lib/repo.ts` and a single `useTodos` hook in
`hooks/useTodos.ts` that loads on mount and saves on every mutation.

Rationale:
- The pattern is legible: `useTodos` exposes `{ todos, loading, addTodo, toggleTodo,
  deleteTodo }`. A developer can read the hook implementation in one pass and understand
  the full data lifecycle.
- No additional store package is needed (no `@reduxjs/toolkit`, no `zustand`, no
  `jotai`). This keeps the `package.json` short and the example dep-light.
- The separation between the in-memory repo (`lib/repo.ts`) and the storage layer
  (`lib/storage.ts`) mirrors the backend's separation between a repo module and a
  database adapter. A contributor reading this example learns: repos are synchronous
  in-memory state; storage is async I/O; services orchestrate between them.
- The `useTodos` hook is the mobile analog of a route handler: it is the entry point from
  the UI layer into the service layer. This maps to the backend's
  `route handler → service → repo` chain as `screen → hook → service → repo + storage`.
  Both are documented in `code-architectures/layered.md`.
- A contributor who wants to scale this pattern up to a real app can swap the module
  singleton for a Zustand store, or replace the `useTodos` hook with a TanStack Query
  hook, without changing the service or storage layers.

See `../system-design.md` for the full component breakdown and data flow diagram.

## consequences

Positive:
- the screen → hook → service → repo + storage split maps directly onto the layered
  architecture reference in `code-architectures/layered.md` without requiring a React
  state management library
- Expo Router's file-system routing makes the navigation structure immediately visible
  from the file tree — no separate navigator configuration to read
- AsyncStorage's zero-config managed workflow integration means the example works on a
  fresh checkout with just `npx expo install`
- the `lib/storage.ts` abstraction means swapping AsyncStorage for SQLite (v0.2.0) or a
  network API (v0.3.0) only changes one file; screens and hooks are unaffected
- pure service functions (`services/todos.ts`) are testable in Jest without mounting a
  React component — the same testability property as the Next.js example's pure service
  functions

Negative:
- the module-level singleton repo means tests that run in the same Jest worker share
  state unless they call `lib/repo.setTodos([])` in `beforeEach`; this is documented in
  the test plan
- the load-on-mount pattern means the list screen shows a loading indicator briefly on
  every mount; this is acceptable for the example but may flash in fast environments
- AsyncStorage is not suited to large datasets or complex queries; this is a documented
  non-goal

Neutral:
- Expo Router requires `expo-router` and `react-native-screens` + `react-native-safe-area-context`
  as peer dependencies; these are included in the Expo managed workflow and add no
  configuration burden

## alternatives considered

| alternative | why not chosen |
|---|---|
| React Navigation manual setup | more boilerplate; no teaching benefit over Expo Router for a two-screen app; diverges from the file-system routing mental model the system promotes |
| SQLite (via `expo-sqlite`) | schema migration complexity; overkill for one entity at small scale; managed workflow requires a config plugin in SDK 55 |
| MMKV | not part of managed workflow without a native config plugin; faster than AsyncStorage but irrelevant at this scale |
| Redux Toolkit | adds 3+ packages and a significant boilerplate surface for a 4-function todo list; obscures the layered architecture the example is trying to teach |
| Zustand | reasonable choice for a real app; omitted here because the thin hook pattern teaches more about the layering, and a contributor can easily add Zustand on top of the existing service layer in a future version |
| TanStack Query | appropriate when the data source is a network API; not appropriate for a purely local AsyncStorage store in v0.1.0 |
| Context API (React) | no external dependency; but a module-level singleton is simpler for a reference that has no subtree isolation requirement |

## links

- PRD: `../../requirements/prd.md` — non-goals (no API, AsyncStorage only)
- system design: `../system-design.md` — component breakdown and data flow
- architecture reference: `code-architectures/layered.md` (system repo root)
- tech stack: `../tech-stack.md` — version pins
- data contract: `../../specs/data-contract.md` — AsyncStorage schema
