# regression checklist — hello-todo-react-native-expo

Run this checklist before every release (including patch releases).

## automated checks

- [ ] `npm install` — completes without errors and no peer dependency warnings that block functionality.
- [ ] `npx tsc --noEmit` — exits zero; no TypeScript errors.
- [ ] `npx eslint .` — exits zero; no lint errors.
- [ ] `npx jest` — all test suites report passing; no failures; no skipped tests that were not intentionally skipped.

## manual smoke

- [ ] Complete `docs/tests/manual-test-checklist.md` sections 0–13 on at least two of the three targets (iOS simulator, Android emulator, Web).

## ci gate

- [ ] The GitHub Actions CI workflow is green on the release commit / tag.

## release artifact

- [ ] `CHANGELOG.md` has an entry for the version being released with the correct date.
- [ ] `package.json` `version` field matches the release version.
- [ ] `app.json` `version` (and `ios.buildNumber` / `android.versionCode` if applicable) is updated for a store release.

## after release (local-only v0.1.0)

- [ ] Tag created (`git tag v<version>`).
- [ ] App launches from Expo Go on iOS simulator after a clean `npx expo start`.
- [ ] AsyncStorage persistence verified: create a todo, force-quit, relaunch, confirm todo is present.

## after release (EAS build — future)

The following items are not applicable for the local-only v0.1.0 reference but should
be added to this checklist when EAS builds are wired up:

- [ ] `eas build --platform ios` and `--platform android` complete without errors.
- [ ] TestFlight / Google Play internal testing track updated.
- [ ] OTA update (expo-updates) tested on a prior binary if applicable.
- [ ] Rollback bundle available and tested per `docs/release/rollback-plan.md`.
