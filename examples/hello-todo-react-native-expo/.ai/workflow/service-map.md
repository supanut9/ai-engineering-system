# service map — hello-todo-react-native-expo

## processes

| name | type | notes |
|---|---|---|
| hello-todo-react-native-expo | React Native app (Expo managed workflow) | runs on iOS simulator, Android emulator, physical device, or Expo Web; no TCP listener; not addressable over a network |
| Metro bundler | dev-time bundler | started by `npx expo start`; serves the JS bundle to the runtime; default port 8081 (development only) |

## persistence layer

| name | type | notes |
|---|---|---|
| AsyncStorage | key-value store (on-device) | provided by `@react-native-async-storage/async-storage`; reads/writes to device storage; data survives app restart; cleared on app uninstall |

## screen routes (Expo Router)

| path | file | notes |
|---|---|---|
| `/` (index) | `app/index.tsx` | list screen; renders all todos |
| `/add` (modal) | `app/add.tsx` | modal route for creating a new todo |

## dependencies

| from | to | type | notes |
|---|---|---|---|
| hello-todo-react-native-expo | AsyncStorage | on-device I/O | all reads and writes go through `lib/storage.ts`; no network call |
| hello-todo-react-native-expo | Metro | dev-time only | Metro is not a runtime dependency; only needed during development |
| hello-todo-react-native-expo | Expo Go / dev build | runtime host | during development the app JS bundle runs inside the Expo Go client or a development build; in production, the bundle is embedded in the EAS build artifact |

## external services (future / documented, not wired in v0.1.0)

| name | notes |
|---|---|
| Expo Application Services (EAS) | used for CI/CD builds and store submission; not invoked for the local-only v0.1.0 reference |
| App Store Connect / Play Console | target submission destination; documented in `docs/release/deployment-plan.md`; not executed for this example |
| expo-updates OTA | over-the-air JS bundle updates; documented in `docs/release/deployment-plan.md`; not configured in v0.1.0 |
