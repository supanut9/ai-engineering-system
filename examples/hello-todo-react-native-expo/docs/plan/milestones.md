# milestones — hello-todo-react-native-expo

## v0.1.0 — first runnable todo app

| field | value |
|---|---|
| milestone | v0.1.0 |
| description | first runnable todo app with list screen, add modal, AsyncStorage persistence, passing tests, and complete phase 0–8 documentation |
| planned start | 2026-05-16 |
| planned end | 2026-05-16 |
| owner | Example Maintainer <maintainer@example.com> |
| status | shipped |

### acceptance criteria for this milestone

All criteria defined in `../requirements/acceptance-criteria.md` must be satisfied:

- US-001: view the todo list → list screen renders persisted todos on mount
- US-002: see the empty state → "No todos yet" displayed when list is empty
- US-003: add a todo → add modal creates todo, persists to AsyncStorage, updates list
- US-004: reject an empty or whitespace-only title → inline error, modal stays open
- US-005: toggle a todo's completion → completed state flips, persisted to AsyncStorage
- US-006: delete a todo → item removed from list and AsyncStorage
- US-007: persist todos across app restarts → todos survive full app close/relaunch
- US-008: run on iOS, Android, and Web → no platform-specific errors on any target

### exit criteria

- `npx jest` passes with no failures
- `npx tsc --noEmit` exits zero
- `npx expo start` launches the app without errors in Expo Go on iOS simulator
- all eight tasks (TODO-001 through TODO-008) have status `completed`
- `workflow-state.md` reflects Phase 8: Maintenance

### parking-lot items (v0.2.0+)

- edit-in-place for existing todo title
- due dates and priorities (data model extension)
- cloud sync with a backend API or Supabase
- EAS production build and App Store / Play Store submission
- push notifications for due date reminders
- swipe-to-delete gesture (native feel improvement)
- dark mode / theme system
- accessibility audit and VoiceOver / TalkBack support
- OTA updates via `expo-updates`
- Sentry or Crashlytics crash reporting
