# runbook — hello-todo-react-native-expo

## system overview

`hello-todo-react-native-expo` is a React Native / Expo managed-workflow application.
It stores todos locally in AsyncStorage. There is no server process, no port, no database
to connect to. The JS bundle runs inside the Expo runtime (Hermes on iOS/Android, V8 on
Web). In development the bundle is served by Metro; in production it is embedded in the
EAS-built binary or published as an OTA update.

- entry point: `npx expo start` (development) or EAS build (production)
- bundler: Metro (development only; default port 8081)
- persistence: AsyncStorage — `@hello_todo:todos` key on the device
- logs: Metro terminal output in development; Expo dashboard / crash reporter in production

---

## starting the app

### iOS simulator

```bash
npx expo start
# then press 'i' in the Metro prompt
```

Xcode must be installed and a simulator must be available. The first launch installs the
Expo Go client on the simulator automatically.

### Android emulator

```bash
npx expo start
# then press 'a' in the Metro prompt
```

An Android emulator must be running (launch via Android Studio's AVD Manager).

### Web

```bash
npx expo start --web
# or press 'w' in the Metro prompt
```

Opens a browser tab at `http://localhost:8081` (or the next available port).

### physical device (Expo Go)

```bash
npx expo start
```

Scan the QR code displayed in the terminal with the Expo Go app (iOS: App Store,
Android: Play Store).

### development build (without Expo Go)

If the app uses a custom native module that is not in Expo Go, build a development build:

```bash
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

Install the resulting binary on the simulator or device and scan the QR code as above.

---

## stopping the development server

Press `Ctrl-C` in the Metro terminal. This stops the Metro bundler; the app on the
simulator / device may freeze or show a "No connection" overlay until Metro is restarted.

---

## checking that the app is working

There is no health endpoint. Verify the app is healthy by:

1. Opening the list screen: no red error screen; todos (or empty state) is visible.
2. Adding a todo: modal opens, title is accepted, item appears on the list.
3. Relaunching: all previously created todos are still present.

---

## where logs go

### development

All JavaScript errors, warnings, and `console.log` / `console.error` output appear in the
Metro terminal. The device/simulator also shows the React Native red error screen for
unhandled exceptions, with a full stack trace.

```bash
# Start Metro with verbose output if needed:
npx expo start --clear
```

The `--clear` flag clears the Metro transform cache, which resolves most "module not
found" or stale-bundle errors.

### production (EAS / OTA)

Logs are available in the Expo dashboard:
```
https://expo.dev/accounts/<account>/projects/<slug>/builds
```

For crash reporting in production, integrate Sentry (future; see known-issues.md).

---

## resetting AsyncStorage

To clear all persisted todos during development or testing:

**Option A — from code:** Call `lib/storage.clearTodos()` in a debug screen or in the
React Native Debugger console:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('@hello_todo:todos');
```

**Option B — uninstall the app:** Uninstalling from the simulator or device removes all
AsyncStorage data. Reinstall via Expo Go or rebuild.

**Option C — from the React Native Debugger:** Open the AsyncStorage inspector tab,
find the `@hello_todo:todos` key, and delete it.

---

## clearing the Metro cache

If the app shows stale code or module resolution errors:

```bash
npx expo start --clear
```

This deletes Metro's transform cache. Restart the Metro server and re-open the app.

---

## upgrading Expo SDK

When a new Expo SDK is released:

```bash
npx expo install expo@latest
npx expo install --fix   # re-aligns all Expo-managed peer dependencies
npx tsc --noEmit         # confirm no TypeScript regressions
npx jest                 # confirm tests still pass
```

Read the Expo SDK upgrade guide at `https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/`
before proceeding. Pay attention to breaking changes in `expo-router` and
`@react-native-async-storage/async-storage`.

---

## interpreting Metro error messages

| message | cause | fix |
|---|---|---|
| `Unable to resolve module` | missing or mis-typed import path | check import path; run `npx expo install` |
| `Invariant Violation: "main" has not been registered` | entry point misconfigured | check `package.json` `main` field points to `expo-router/entry` |
| `Expo Router: No routes found` | `app/` directory is missing or has no files | confirm `app/index.tsx` exists |
| `AsyncStorage has been extracted` | using the removed RN core AsyncStorage | confirm `@react-native-async-storage/async-storage` is installed |
| `Transform error` | TypeScript or Babel config issue | run `npx expo start --clear`; check `tsconfig.json` and `babel.config.js` |

---

## EAS build logs (production)

View build logs at:
```
https://expo.dev/accounts/<account>/projects/<slug>/builds/<build-id>
```

Or via CLI:
```bash
eas build:list
eas build:view <build-id>
```

---

## rollback

See `docs/release/rollback-plan.md` for OTA rollback and store rollback procedures.
