# React Native + Expo

## Use When

Use this blueprint when:

- the product targets iOS and/or Android (with optional web support)
- the team wants a managed Expo workflow with OTA updates
- the stack is React Native + TypeScript
- file-based routing is preferred (Expo Router)

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript (strict) | All source files `.ts` / `.tsx` |
| Framework | React Native | Version pinned by Expo SDK |
| SDK / toolchain | Expo SDK 55 | Source of truth for all native packages |
| Routing | Expo Router | File-based; screens under `app/` |
| Styling | StyleSheet.create | Add NativeWind or Tamagui for design system |
| State | useState + Context | Add Zustand when justified |
| Networking | fetch + @tanstack/react-query | Query when server state gets complex |
| Secure storage | expo-secure-store | Required for tokens; never AsyncStorage |
| Testing | jest-expo + @testing-library/react-native | Pin jest@29 (jest-expo requirement) |
| Linting | eslint-config-expo | |
| Native builds | EAS Build | |
| OTA updates | EAS Update | |

## Code Architecture

Screens live under `app/` following Expo Router file conventions. Keep screens
thin — business rules and API calls belong in `services/` and `hooks/`.

- `components/` — presentational, platform-agnostic UI components
- `hooks/` — custom React hooks (data fetching, device APIs, auth state)
- `services/` — API clients, third-party integrations, auth flows
- `types/` — shared TypeScript types and interfaces
- `constants/` — design tokens, route names, environment values
- `assets/` — images, fonts, icon sets

## Bootstrap

Use the pre-configured skeleton:

```bash
cp -r templates/skeletons/react-native-expo/ my-app
cd my-app
npm install --legacy-peer-deps
npm start
```

## Folder Structure

```text
app/
  _layout.tsx          <- root layout (Stack navigator, providers)
  index.tsx            <- home screen
components/
hooks/
services/
types/
constants/
assets/
__tests__/
docs/
  requirements/ specs/ architecture/ plan/ tests/ release/ maintenance/
.ai/
  workflow/
```

## Folder Responsibilities

- `app/` — Expo Router screens and layouts only; keep thin
- `components/` — shared UI; no screen-level business logic
- `hooks/` — abstract device APIs, auth state, data fetching
- `services/` — API clients, third-party wrappers
- `types/` — TypeScript types and enums shared across the app
- `constants/` — colors, spacing, config values
- `__tests__/` — test files; mirror source structure
- `docs/` — workflow phase artifacts (requirements through maintenance)
- `.ai/workflow/` — agent context files

## Required Workflow Files

- `AGENTS.md` or `CLAUDE.md` depending on the agent tool in use
- `.ai/workflow/project-context.md`
- `.ai/workflow/workflow-state.md`
- `.ai/workflow/active-task.md`

## Notes and Constraints

**app.json / app.config.ts** — holds name, slug, version, icons, and platform
config. Rename to `app.config.ts` for dynamic config (env vars at build time).
Set `bundleIdentifier` (iOS) and `package` (Android) before the first EAS build.

**Native vs JS-only changes** — JS changes (screens, styles, API calls) deploy
via EAS Update without store review. Native changes (new SDK module, config
plugin, permissions) require a full EAS Build + store submission. Batch native
changes into dedicated sprints.

**expo prebuild** — generates `ios/` and `android/` directories. In the managed
workflow, gitignore these and let EAS Build generate them on the build server.

**TypeScript** — extends `expo/tsconfig.base`. Keep `"strict": true`. Add
`"types": ["jest"]` to include jest globals in test files.
