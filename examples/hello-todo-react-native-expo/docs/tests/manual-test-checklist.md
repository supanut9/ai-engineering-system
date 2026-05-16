# manual test checklist — hello-todo-react-native-expo v0.1.0

Run these steps against a locally running app before every release. Start the development
server with `npx expo start`, then open on each target platform. The checklist must be
completed on at least the iOS simulator and one additional target (Android emulator or
Web) before release.

---

## 0. pre-flight

- [ ] `npm install` (or `npx expo install`) completes without error.
- [ ] `npx jest` passes — all test suites show no failures.
- [ ] `npx tsc --noEmit` exits zero.
- [ ] `npx eslint .` exits zero with no errors.
- [ ] `npx expo start` starts Metro without errors and prints a QR code / launch options.

---

## 1. app launch — iOS simulator

- [ ] Open in iOS simulator via `npx expo start` → press `i`.
- [ ] App loads without a red error screen.
- [ ] List screen is visible with the header "My Todos".

---

## 2. app launch — Android emulator

- [ ] Open in Android emulator via `npx expo start` → press `a`.
- [ ] App loads without a red error screen.
- [ ] List screen is visible.

---

## 3. app launch — Web

- [ ] Open in browser via `npx expo start --web` or press `w` in the Metro prompt.
- [ ] Browser tab opens without a console error.
- [ ] List screen is visible.

---

## 4. empty state

On a fresh install with no persisted todos:

- [ ] List screen displays "No todos yet" (or equivalent empty state message).
- [ ] No todo items are rendered.

---

## 5. add a todo

- [ ] Tap the "Add Todo" button on the list screen.
- [ ] The add modal slides up.
- [ ] The title input is focused automatically.
- [ ] Type `"Buy milk"` and tap Save (or equivalent submit action).
- [ ] The modal dismisses.
- [ ] `"Buy milk"` appears on the list screen.
- [ ] The item shows as incomplete (no strikethrough, checkbox unchecked).

---

## 6. add a todo with surrounding whitespace

- [ ] Open the add screen and type `"  Call dentist  "` (leading and trailing spaces).
- [ ] Tap Save.
- [ ] The modal dismisses.
- [ ] The title on the list screen is `"Call dentist"` (trimmed).

---

## 7. add todo — validation errors

**7a. empty title:**

- [ ] Open the add screen. Leave the input empty. Tap Save.
- [ ] Modal stays open.
- [ ] Inline error message is visible (e.g., "Title is required").
- [ ] No new todo appears on the list.

**7b. whitespace-only title:**

- [ ] Open the add screen. Type `"   "` (spaces only). Tap Save.
- [ ] Same behavior as 7a.

**7c. title over 200 characters:**

- [ ] Open the add screen. Paste or type a string of 201 characters. Tap Save.
- [ ] Modal stays open.
- [ ] Inline error message mentions length limit.
- [ ] No new todo appears on the list.

**7d. clear error and resubmit:**

- [ ] With the error visible, clear the input and type a valid title. Tap Save.
- [ ] Error message disappears.
- [ ] Modal dismisses and todo appears on the list.

---

## 8. cancel add

- [ ] Open the add screen. Type some text.
- [ ] Tap Cancel (or swipe down on iOS to dismiss the modal).
- [ ] Modal dismisses.
- [ ] The list is unchanged — no partial todo was created.

---

## 9. toggle completion

- [ ] On the list screen, tap the toggle/checkbox for `"Buy milk"`.
- [ ] `"Buy milk"` shows as completed (strikethrough or checkmark).
- [ ] Tap the toggle again.
- [ ] `"Buy milk"` shows as incomplete.

---

## 10. delete a todo

- [ ] On the list screen, tap the delete control for `"Buy milk"`.
- [ ] `"Buy milk"` is immediately removed from the list.

---

## 11. persist across restart

- [ ] Ensure at least one todo exists (e.g., `"Call dentist"`, marked completed).
- [ ] Force-quit the app (or close the browser tab for Web, then reopen).
- [ ] Relaunch the app via Expo Go or refresh the Web tab.
- [ ] `"Call dentist"` is present on the list screen.
- [ ] Its `completed` state is preserved.

---

## 12. delete all todos — empty state

- [ ] Delete every remaining todo one by one.
- [ ] After the last item is deleted, the empty-state message is shown.

---

## 13. platform parity spot-check

Run steps 5, 9, and 10 on all three platforms (iOS simulator, Android emulator, Web)
and confirm identical behavior.

- [ ] iOS: add, toggle, delete all work.
- [ ] Android: add, toggle, delete all work.
- [ ] Web: add, toggle, delete all work.
