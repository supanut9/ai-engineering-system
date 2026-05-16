# product requirements document — hello-todo-react-native-expo

## overview

`hello-todo-react-native-expo` is a single-user, offline-first todo-list application
built with React Native, Expo (managed workflow), Expo Router, and TypeScript using a
layered architecture. It serves as the mobile canonical filled-in example for the
ai-engineering-system, demonstrating what every workflow phase looks like for a real — if
intentionally tiny — project. The app persists todos locally in AsyncStorage, navigates
between a list screen and a modal add screen via Expo Router's file-system routing, and
runs on iOS, Android, and Web.

## goals

- provide a fully functional mobile todo list that creates, lists, toggles, and deletes
  todo items with offline-first persistence
- demonstrate the ai-engineering-system workflow artifacts filled in end-to-end for a
  mobile project, showing how phases diverge from a backend example (no API spec, no port,
  deployment via EAS rather than Node.js process management)
- keep the implementation simple enough that a developer can read the entire codebase in
  under one hour
- serve as a stable reference for the Expo Router layered architecture pattern

## non-goals

- network-backed or cloud-synced persistence: data is AsyncStorage only; loss on
  uninstall is acceptable for v0.1.0
- authentication or authorization
- multi-tenancy or user accounts
- a REST, GraphQL, or RPC API surface
- production EAS build submission (documented as a path, not executed for this example)
- push notifications, background fetch, or deep-link handling
- sub-tasks, labels, priorities, or due dates on todos
- production observability (Sentry, Crashlytics, analytics)

## target users

Developers learning the ai-engineering-system who need a concrete reference showing
what a complete set of phase artifacts looks like for a small React Native / Expo mobile
application.

## functional requirements

### FR-01: view todo list

The list screen (`app/index.tsx`) displays all persisted todos on mount. Todos are loaded
from AsyncStorage via the `useTodos` hook. An empty-state message is shown when no todos
exist.

### FR-02: add a todo

A floating action button (or equivalent navigation trigger) on the list screen opens the
add screen (`app/add.tsx`) as a modal route. The add screen accepts a title (non-empty
string, max 200 characters trimmed). On submission, the todo is created in the in-memory
repo, saved to AsyncStorage, and the modal is dismissed; the list screen reflects the new
item without a full reload.

### FR-03: toggle completion

Each todo item on the list screen has a control to toggle its `completed` state. Toggling
updates the in-memory repo, persists the change to AsyncStorage, and re-renders the list.

### FR-04: delete a todo

Each todo item on the list screen has a delete control. Deleting removes the item from the
in-memory repo, persists the change to AsyncStorage, and re-renders the list.

### FR-05: persist across app restarts

On app launch, the `useTodos` hook loads all todos from AsyncStorage into the in-memory
repo. Any mutations (add, toggle, delete) write back to AsyncStorage before the hook
returns the updated state. Data survives app restart and backgrounding.

### FR-06: run on iOS, Android, and Web

The app must function correctly in Expo Go on iOS and Android, in the iOS simulator, on
an Android emulator, and in a browser via `npx expo start --web`. No platform-specific
code is required for v0.1.0 — Expo's managed workflow and AsyncStorage's cross-platform
shim handle this.

## non-functional requirements

### NFR-01: load time

The list screen must render with persisted todos within 500 ms of app launch on a mid-tier
device (2018-era iPhone or equivalent Android). No explicit performance budget enforced in
v0.1.0 — this is a guideline.

### NFR-02: validation

The add screen must reject an empty or whitespace-only title with an inline error message
before calling the service. Titles are trimmed before storage.

### NFR-03: persistence durability

All mutations are written to AsyncStorage synchronously within the mutation handler (await
before returning). Data must survive a controlled app restart.

### NFR-04: platform parity

All core interactions (add, toggle, delete, list) must work identically on iOS, Android,
and Web. Known Web caveats (e.g., Expo Router Web uses React DOM instead of React Native
views) are noted in `docs/maintenance/known-issues.md`.

### NFR-05: typecheck pipeline

`npx tsc --noEmit` must exit zero on a clean checkout. This serves as the build gate in
the absence of a traditional server build step.

## success criteria

- `npx jest` passes with no failures from a clean checkout
- `npx tsc --noEmit` exits zero
- the list screen loads previously persisted todos when the app is relaunched
- the add screen dismisses and updates the list after a successful create
- a developer unfamiliar with the project can start the app with `npx expo start` and
  exercise every user story in under five minutes on a simulator or device

## scope

### in scope for v0.1.0

- list screen (FR-01, FR-03, FR-04, FR-05)
- add screen / modal route (FR-02)
- offline-first AsyncStorage persistence (FR-05)
- cross-platform target: iOS, Android, Web (FR-06)
- input validation in the service layer and add screen (NFR-02)
- typecheck pipeline: `npx tsc --noEmit`
- ESLint with eslint-config-expo flat config
- Jest with jest-expo preset and @testing-library/react-native

### out of scope for v0.1.0

- edit-in-place for existing todos (title change post-create)
- due dates or priorities
- cloud sync or a backend API
- EAS production build or store submission
- push notifications
- search or filtering on the list screen
- drag-to-reorder
- dark mode or theme system
- accessibility audit

## open questions

1. Should a later version support editing an existing todo title in-place? The current
   data model supports `update` in the service but no UI exposes it. Deferred to v0.2.0
   discussion.

2. Should the list screen support swipe-to-delete (native gesture) in addition to the
   delete control? No decision needed for v0.1.0.
