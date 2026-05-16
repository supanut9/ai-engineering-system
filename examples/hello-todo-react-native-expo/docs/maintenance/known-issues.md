# known issues — hello-todo-react-native-expo v0.1.0

## 1. persistence is local-only; no cloud sync

**severity:** info (by design in v0.1.0)

All todos are stored in AsyncStorage on the user's device. Uninstalling the app deletes
all data. There is no backup, no multi-device sync, and no way to recover lost todos.

**upgrade path:** Add a backend sync layer — for example, Supabase (Postgres + Row Level
Security + real-time) or a custom REST API. The service layer (`services/todos.ts`) would
need to call the remote API in addition to (or instead of) AsyncStorage. The UI layer and
hook are unaffected by this change. Target: v0.2.0.

---

## 2. no crash reporting or remote observability

**severity:** warning — problematic for a shipped production app

There is no Sentry, Crashlytics, or Expo Application Services crash reporting configured
in v0.1.0. JavaScript exceptions that are not caught will surface as a red error screen
in development and a crash in production without any remote record.

**upgrade path:** Install and configure `@sentry/react-native` with Expo. This requires
a Sentry project, a DSN configured in `app.json` or an environment variable, and the
Sentry Expo plugin in `app.json` plugins. A development build is required (Sentry
integration does not work in Expo Go for source maps). Target: before any production
store release.

---

## 3. OTA updates not configured

**severity:** info

`expo-updates` is not configured in v0.1.0. There is no OTA update channel set up, and
the `checkOnLaunch` policy is not defined. Published OTA bundles would not be received
by the app.

**upgrade path:** Add `expo-updates` to `app.json` and configure an `eas.json` channel.
Add `updates.url` and `updates.checkOnLaunch` to `app.json`. This is a managed workflow
operation requiring no native code changes. Target: before the first EAS store submission.

---

## 4. no edit-in-place for existing todos

**severity:** info (by design in v0.1.0)

The UI does not expose a way to change the title of an existing todo. The service layer
supports `updateTodo` in the repo, but no screen or interaction wires up to it.

**upgrade path:** Add an inline `TextInput` on `TodoItem` that activates on long-press
or a separate edit icon. The service call `services.updateTodo(id, { title })` is already
available. Target: v0.2.0.

---

## 5. AsyncStorage write failure is silent

**severity:** info

If `lib/storage.saveTodos()` throws (e.g., storage quota exceeded on a Web target), the
error is caught and logged to the console but no user feedback is shown. The in-memory
state is still updated, so the UI looks correct — but the change will not survive a
restart.

**upgrade path:** Surface a non-blocking toast or alert to inform the user that their
change could not be saved. Target: v0.2.0.

---

## 6. Web target uses localStorage shim; behavior differs from native

**severity:** info

On the Web target (`npx expo start --web`), `@react-native-async-storage/async-storage`
uses a `localStorage` shim. The practical effects in v0.1.0 are minimal, but localStorage
has a 5 MB limit (vs. unlimited on native) and behaves differently under private browsing
(data is cleared on session end in some browsers).

**upgrade path:** For a serious Web target, consider using a dedicated Web storage
solution (e.g., IndexedDB) and conditionally selecting the storage adapter at runtime.
Target: only if Web is a first-class distribution target in a future version.

---

## 7. Expo SDK version updates break the example periodically

**severity:** info

The Expo SDK releases major versions approximately every quarter. Peer dependencies
(React, React Native, react-native-screens, etc.) are updated in lock-step. The example
will require maintenance when SDK 56 or later is released.

**upgrade path:** Run `npx expo install expo@latest` followed by `npx expo install --fix`
when a new SDK ships. Verify `npx tsc --noEmit` and `npx jest` still pass. Update the
version pins in `docs/architecture/tech-stack.md`. Target: within 30 days of each SDK
release.
