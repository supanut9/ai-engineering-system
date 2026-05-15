# React Native (with Expo)

React Native lets you build native iOS and Android apps (and, optionally, web)
from a single TypeScript/JavaScript codebase. Expo is the managed layer on top
that handles tooling, native modules, OTA updates, and app-store publishing.

## When to Use

Use this stack when:

- the product targets iOS and Android (and optionally web) from one codebase
- OTA (over-the-air) JS-only updates are a business requirement
- the team wants a managed workflow with minimal native tooling setup
- you need device APIs (camera, push notifications, biometrics, location) without
  writing Swift or Kotlin

Avoid when the product is web-only (use Next.js), desktop-only (use Tauri), or
the team has no React background.

## Default Toolchain

| Role | Tool |
|---|---|
| SDK and managed workflow | Expo SDK (source of truth for RN version) |
| File-based routing | Expo Router |
| Native binary builds | EAS Build |
| OTA JS-only updates | EAS Update |
| App store submission | EAS Submit |
| Language | TypeScript (strict) |
| Testing | jest-expo + @testing-library/react-native |
| Linting | eslint-config-expo |

Expo SDK pins the React Native version. Do not pick a React Native version
independently.

## Why Expo (Versus Bare React Native)

| Concern | Expo managed | Bare RN |
|---|---|---|
| Native build setup | Handled by EAS; no local Xcode/Android Studio required | Full Xcode + Android Studio locally |
| OTA updates | EAS Update ships JS-only fixes without store review | Requires CodePush or full release |
| Config plugins | Extend native config without ejecting | Direct native file edits |
| When to prefer bare | Almost never for new projects | Hard native dep that cannot use a config plugin |

## Project Layout

Expo Router (file-based routing) is the recommended default.

```text
app/
  _layout.tsx          <- root layout; wrap with providers here
  index.tsx            <- home screen (maps to /)
  (tabs)/
    _layout.tsx        <- tab navigator
components/            <- shared presentational components
hooks/                 <- custom hooks (useAuth, useTheme, etc.)
services/              <- API calls, external integrations
types/                 <- shared TypeScript types
assets/                <- images, fonts, icons
__tests__/
```

## State Management

Start with `useState` and React Context. Reach for a library only when:

- deeply nested state is causing excessive re-renders
- async state (loading/error/data) is repeated across many components

Preference order: `useState` + Context → Zustand → Redux Toolkit.

## Networking

Use native `fetch` for simple calls. Add `@tanstack/react-query` when managing
server state across multiple components (caching, refetching, pagination).

## Authentication

- Store tokens in `expo-secure-store` (hardware-backed keychain/keystore), not
  `AsyncStorage` (unencrypted).
- Use `expo-auth-session` for OIDC/OAuth2 flows with deep-link redirects.

## Testing

Configure `jest-expo` as the Jest preset. It sets up the transformer and mocks
native modules. Note: `jest-expo` requires Jest 29; pin `"jest": "^29.7.0"` in
devDependencies and add `@react-native/jest-preset` explicitly.

Use `@testing-library/react-native` for component tests. Run with:
`jest --watchAll=false`

## Build and Release

| Task | Command |
|---|---|
| Local dev (Expo Go) | `npx expo start` |
| Development build | `eas build --profile development` |
| Production binary | `eas build --profile production` |
| OTA JS-only update | `eas update --branch production` |
| App store submission | `eas submit` |

## Native Modules

Three tiers: (1) Expo SDK modules — prefer first; (2) config plugins — extend
native config without ejecting; (3) custom native modules in Swift/Kotlin — needs
a development build, cannot run in Expo Go.

## Common Pitfalls

- **AsyncStorage for tokens** — use `expo-secure-store` instead.
- **Independent RN version** — let Expo SDK dictate it; mismatches cause crashes.
- **Inline styles in renders** — use `StyleSheet.create()` to avoid object churn.
- **No SafeAreaView** — UI clips under notches; use `react-native-safe-area-context`.
- **jest@30 with jest-expo** — jest-expo 55 bundles jest 29 internally; pin jest@29.

## See Also

- Project template: `project-templates/mobile/react-native-expo.md`
- Skeleton: `templates/skeletons/react-native-expo/`
- Testing standards: `standards/testing.md`
- Security standards (token storage): `standards/security.md`
