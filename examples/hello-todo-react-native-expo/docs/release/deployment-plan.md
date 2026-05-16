# deployment plan — hello-todo-react-native-expo v0.1.0

## goal

Release: v0.1.0 — initial documented release.
Target environment for v0.1.0: local development only (Expo Go / development build on
iOS simulator, Android emulator, or Web). The store submission path (App Store /
Play Store) is documented below for completeness and to serve as the reference artifact,
but it is not executed for this example.

## scope

A React Native / Expo managed-workflow application. There is no server process, no port
binding, and no infrastructure to provision. "Deploying" means producing a native binary
via EAS Build and submitting it to the appropriate store, or publishing an OTA JS bundle
update via expo-updates.

Out of scope: TLS, backend infrastructure, database migrations, container orchestration.

---

## development / local testing (executed for v0.1.0)

### prerequisites

- Node.js (any LTS version compatible with Expo SDK 55)
- Expo CLI: `npm install -g expo-cli` or use `npx expo`
- Xcode (for iOS simulator) or Android Studio (for Android emulator)
- Expo Go app on a physical device (optional)

### steps

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Metro bundler:

   ```bash
   npx expo start
   ```

3. Open on a target:
   - iOS simulator: press `i` in the Metro prompt
   - Android emulator: press `a`
   - Web browser: press `w` or `npx expo start --web`
   - Physical device: scan the QR code with Expo Go

4. Verify:
   - App loads without a red error screen.
   - List screen is visible.
   - Add, toggle, and delete all function correctly.
   - Force-quit and relaunch; confirm todos persist.

---

## EAS build — iOS and Android (documented; not executed for v0.1.0)

### prerequisites

- An Expo account and an EAS project linked (`eas init`)
- Apple Developer account (for iOS distribution)
- Google Play Console account (for Android distribution)
- `eas.json` configured with `development`, `preview`, and `production` build profiles

### build steps

1. Configure EAS:

   ```bash
   eas login
   eas build:configure
   ```

   This generates `eas.json`.

2. Produce a production build:

   ```bash
   # iOS
   eas build --platform ios --profile production

   # Android
   eas build --platform android --profile production

   # Both in parallel
   eas build --platform all --profile production
   ```

   EAS compiles the native binary in Expo's cloud infrastructure. No local Xcode or
   Android SDK required for cloud builds. Build logs are available at
   `https://expo.dev/accounts/<account>/projects/<slug>/builds`.

3. Download the build artifact from the EAS dashboard or via:

   ```bash
   eas build:list
   ```

---

## EAS submit — App Store and Play Store (documented; not executed for v0.1.0)

### iOS (App Store Connect)

1. Ensure the production build from the previous step is complete and shows status
   `finished` in the EAS dashboard.

2. Submit to App Store Connect:

   ```bash
   eas submit --platform ios --latest
   ```

   EAS Submit uploads the `.ipa` directly to App Store Connect. Requires an app record
   already created in App Store Connect with the correct bundle identifier.

3. In App Store Connect:
   - Add the build to a TestFlight group for internal testing.
   - After internal testing passes, submit for App Store review.
   - Expected review time: 24–48 hours (variable).

4. On approval, release immediately or set a scheduled date.

### Android (Google Play Console)

1. Submit the `.aab` from EAS:

   ```bash
   eas submit --platform android --latest
   ```

2. In Google Play Console:
   - Promote to the Internal testing track first.
   - After internal testing, promote to Closed testing (alpha / beta) or Production.
   - Staged rollout: start at 10%, monitor crash rate, expand to 100% over 48 hours.

---

## OTA updates via expo-updates (documented; not configured in v0.1.0)

`expo-updates` allows publishing new JS bundles to deployed binaries without a store
review cycle. The native shell stays the same; only the JavaScript layer is updated.

### publish an OTA update

```bash
eas update --branch production --message "Fix: toggle state not persisting"
```

### when OTA is appropriate

- bug fixes that do not touch native code
- UI changes, copy changes, logic fixes
- OTA is **not** appropriate for: adding new native modules, changing `app.json`
  permissions, or any change that requires a new native build

### OTA rollback

See `docs/release/rollback-plan.md` — OTA section.

---

## migration steps

No database migrations. AsyncStorage schema is forward-compatible for v0.1.0; the
`@hello_todo:todos` key structure does not change between OTA updates unless the schema
is explicitly versioned (future work).

---

## verification

- App launches without a red error screen on iOS and Android.
- List screen loads; add, toggle, and delete all function correctly.
- Todos persist across a full app close and relaunch.
- No JavaScript exceptions in the Expo dashboard or crash reporter.

## owners

- primary: mobile lead / on-call engineer.
- escalation: check `docs/maintenance/runbook.md`.

## timing window

- local development: any time; no coordination needed.
- store submission: schedule at least 48 hours before any required live date to allow
  for App Store review.
- OTA update: can be deployed at any time; takes effect the next time the app is
  foregrounded after the update interval.

## communication

| audience | channel | timing |
|---|---|---|
| internal team | Slack / email | before any store submission |
| users | App Store release notes / in-app changelog | at release |
