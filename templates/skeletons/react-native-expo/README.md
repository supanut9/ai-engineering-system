# my-app

A React Native + Expo application using Expo Router for file-based navigation.

## Quickstart

```bash
# 1. Install dependencies
make setup
# If peer-dependency warnings cause install failure, use:
#   npm install --legacy-peer-deps

# 2. Start the dev server (opens Expo Go on device/simulator)
make run

# 3. Run tests
make test

# 4. Type check
make typecheck

# 5. Lint
make lint
```

## Screens

| File | Route | Description |
|---|---|---|
| `app/index.tsx` | `/` | Home screen |

## Architecture

This skeleton uses **Expo Router** (file-based routing) with a feature-oriented
structure:

- `app/` — Expo Router screens and layouts; keep thin
- `components/` — shared presentational components
- `hooks/` — custom React hooks
- `services/` — API calls and third-party integrations
- `types/` — shared TypeScript types
- `constants/` — colors, spacing, config values
- `assets/` — images, fonts, static files
- `__tests__/` — Jest test files

## Configuration

- `app.json` — Expo app config (name, slug, icons, platform settings)
- `babel.config.js` — Babel with `babel-preset-expo`
- `metro.config.js` — Metro bundler config
- `tsconfig.json` — TypeScript config extending `expo/tsconfig.base`

## Building for App Stores

```bash
# Install EAS CLI once
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure your project (first time only)
eas build:configure

# Build for iOS and Android
eas build --platform all --profile production

# Submit to app stores
eas submit
```

Update `app.json` with your real `bundleIdentifier` (iOS) and `package`
(Android) before the first EAS build. Replace the `com.placeholder.myapp`
placeholder.

## Development

Keep screens thin. Business rules and API calls belong in `services/` and
`hooks/`. Token storage must use `expo-secure-store`, not `AsyncStorage`.
