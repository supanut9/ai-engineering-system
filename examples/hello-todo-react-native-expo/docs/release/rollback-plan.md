# rollback plan — hello-todo-react-native-expo v0.1.0

Companion to `deployment-plan.md`. Review this before any store submission or OTA
publish begins.

## trigger conditions

Roll back when any of the following are observed within 30 minutes of a store release
or OTA publish:

- The app crashes on launch on a significant fraction of devices (> 1% crash-free session
  degradation in the Expo dashboard or Sentry).
- Add, toggle, or delete fails silently or throws a visible JS error.
- AsyncStorage writes fail consistently and todos are not persisted.
- A blocking UI issue (blank screen, infinite loading indicator) affects the list screen.
- Manual call by the on-call engineer or mobile lead.

## decision authority

Single point of accountability: mobile lead or on-call engineer.

One person makes the call — no committee vote during an incident.

---

## rollback: OTA update (JS-only change)

If the release was published as an OTA update via `expo-updates`:

1. Identify the previous OTA bundle ID from the Expo dashboard:
   ```
   https://expo.dev/accounts/<account>/projects/<slug>/updates
   ```

2. Republish the previous bundle to the production branch:

   ```bash
   eas update --branch production --republish --group <previous-update-group-id>
   ```

   Devices will receive the rollback bundle the next time they foreground the app
   (subject to the `updates.checkOnLaunch` policy in `app.json`).

3. Verify: install a fresh copy of the app, confirm it receives the rolled-back bundle
   (check the `Updates.updateId` via Expo DevTools or a debug screen).

4. Data consideration: OTA rollback does not affect AsyncStorage. Todos stored on device
   are preserved. If the bug corrupted AsyncStorage data, see the "Clearing AsyncStorage"
   section in `docs/maintenance/runbook.md`.

---

## rollback: store build (native binary change)

If the release required a new native binary (full EAS build + store submission):

### iOS (App Store)

1. In App Store Connect, navigate to the app's version history.
2. If the problematic version is in staged rollout, pause or halt the rollout immediately:
   - App Store Connect → App Store → Your App → Version → Release Options → Halt Release.
3. Expedite a new submission from the previous build or submit a hotfix build via EAS.
   Apple does not allow rollback to a prior binary for users who already updated; the fix
   must come as a new version.

### Android (Google Play Console)

1. In Google Play Console, navigate to Production → Release dashboard.
2. Use "Rollout" controls to halt the current release and re-activate the previous
   production release:
   - Play Console → Production → Edit Release → Rollout percentage → set to 0% to pause.
   - Promote the previous approved build back to production.
3. Users who have already updated receive the rollback on next auto-update.

---

## data considerations

| concern | action |
|---|---|
| AsyncStorage data after a bad release | Data is on the user's device; it is not affected by app updates or OTA rollbacks. If a code bug corrupted the `@hello_todo:todos` key, add a migration guard in the next build (see known-issues.md). |
| No data loss from OTA rollback | OTA changes only the JS bundle; AsyncStorage is untouched. |
| No data loss from store rollback (Android) | Google Play rollback restores the binary; AsyncStorage is untouched. |
| App Store — no binary rollback for updated users | Apple policy prohibits reverting installed versions; the fix must ship as a new version increment. |

---

## verification after rollback

- App launches without a crash on a representative device.
- List screen loads existing todos correctly.
- Add, toggle, and delete all function correctly.
- No new crashes appear in the Expo dashboard within 15 minutes.

---

## partial vs full rollback

| scenario | approach |
|---|---|
| OTA JS bug | Republish previous OTA bundle; takes effect on next foreground |
| Store binary bug (Android) | Re-activate previous build in Play Console |
| Store binary bug (iOS, post-approval users) | Submit hotfix as new version; halt staged rollout if still in progress |
| v0.1.0 local-only | No store distribution; rollback is simply checking out the previous git tag and running `npx expo start` |

---

## lessons-learned hand-off

After rollback is stable, open a post-incident review:

1. Record the trigger, timeline, and fraction of users affected.
2. Identify root cause.
3. Add a regression test if the cause was a logic defect.
4. Update this rollback plan if the procedure was unclear.
