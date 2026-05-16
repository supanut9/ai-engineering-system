# go-live checklist — hello-todo-react-native-expo v0.1.0

For a local / Expo Go release, work through the engineering readiness and functional
verification sections. For an EAS store release, complete all sections.

## engineering readiness

- [ ] `npx jest` passes on the release commit — all suites passing.
- [ ] `npx tsc --noEmit` exits zero — no TypeScript errors.
- [ ] `npx eslint .` exits zero — no lint errors.
- [ ] CI pipeline is green for the release commit or tag.
- [ ] `npx expo start` launches Metro without errors.
- [ ] App opens without a red error screen on iOS simulator.
- [ ] App opens without a red error screen on Android emulator.
- [ ] App opens in browser (Web target) without console errors.

## configuration

- [ ] `app.json` `version`, `ios.bundleIdentifier`, and `android.package` are correct
      for the release.
- [ ] `app.json` `ios.buildNumber` and `android.versionCode` are incremented from the
      previous build (for EAS store builds; not applicable for local-only v0.1.0).
- [ ] No development-only flags or debug endpoints are active in the release build.

## functional verification

- [ ] Manual test checklist (`docs/tests/manual-test-checklist.md`) sections 0–13
      completed on at least two targets.
- [ ] Add, toggle, and delete all function correctly on iOS.
- [ ] Add, toggle, and delete all function correctly on Android.
- [ ] Persistence verified: create a todo, force-quit, relaunch, confirm todo is present.
- [ ] Empty state is shown when all todos are deleted.

## operations readiness (EAS / store release)

- [ ] EAS build status is `finished` for both iOS and Android.
- [ ] Build artifact downloaded and installed on a physical device for smoke test.
- [ ] Runbook (`docs/maintenance/runbook.md`) reviewed and up to date.
- [ ] Known issues (`docs/maintenance/known-issues.md`) reviewed; no new blockers.
- [ ] Rollback plan (`docs/release/rollback-plan.md`) reviewed; prior OTA bundle or
      previous store build is available.

## post-release verification (EAS / store)

- [ ] TestFlight / internal testing track build is available and installs cleanly.
- [ ] Create a test todo, toggle it, delete it — confirmed working on physical device.
- [ ] No crashes in the Expo dashboard or Sentry within 15 minutes of rollout.
- [ ] OTA update channel is pointed at the correct branch.
