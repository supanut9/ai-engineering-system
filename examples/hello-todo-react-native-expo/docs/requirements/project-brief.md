# project brief — hello-todo-react-native-expo

> This is an intentional reference example for the ai-engineering-system. It is not a
> production starter. Read it to understand what a complete phase-0 project-brief looks
> like for a small React Native / Expo mobile application.

## problem

Developers adopting the ai-engineering-system need a concrete, end-to-end example that
shows what every workflow phase looks like when filled in for a mobile project. Without a
mobile example, the system's documentation reads as if every project has a server, an API
surface, and a port number. A mobile app changes the fundamental architecture: there is no
HTTP listener, persistence is local, deployment means submitting to a store, and testing
means exercising React Native components rather than curl-able endpoints.

## target users

Developers learning the ai-engineering-system who want a React Native / Expo reference
they can compare against their own phase artifacts and against the `hello-todo-nextjs`
backend-oriented reference.

## goal

Deliver a minimal, single-user, offline-first todo-list application in TypeScript (Expo
Router + layered architecture) that walks Phase 0 through Phase 8 of the
ai-engineering-system workflow. The app persists todos in AsyncStorage, navigates between
a list screen and a modal add screen using Expo Router, and runs on iOS, Android, and Web
via the Expo managed workflow. Every artifact in the example should be coherent, realistic,
and useful as a model.

## non-goals

- network-backed persistence (AsyncStorage only for v0.1.0)
- authentication or multi-tenancy
- cloud sync or multi-device support
- a REST or GraphQL API surface
- production EAS store submission (documented but not executed for this local-only example)
- push notifications, deep links, or background tasks
- production-grade crash reporting (noted as a future Sentry/Crashlytics integration)

## success measure

- the list screen renders todos loaded from AsyncStorage on mount
- adding a todo from the modal persists it to AsyncStorage and reflects it on the list
  screen without a full reload
- `npx jest` passes from a clean checkout
- `npx tsc --noEmit` exits zero
- a developer new to the system can read the example docs in under 30 minutes and
  understand how the mobile phases differ from the backend examples

## key risks

| risk | likelihood | mitigation |
|---|---|---|
| example bit-rots as Expo SDK updates | medium | pin SDK and React Native versions in package.json; note update cadence in known-issues |
| AsyncStorage API changes break the example | low | AsyncStorage has a stable API; pin to current version |
| example grows too complex and loses clarity | low | enforce one-day scope cap; reject scope additions |
| Expo Router conventions confuse developers expecting React Navigation | low | ADR-0001 explains the choice and what it teaches |

## time and scope cap

v0.1.0 ships in one focused day for a single developer. Scope is fixed: two screens
(list and a modal add), one entity, AsyncStorage persistence, no auth, no network. Any
additions are deferred to v0.2.0 or later.
