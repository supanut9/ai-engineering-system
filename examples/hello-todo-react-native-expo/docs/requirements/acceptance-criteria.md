# acceptance criteria — hello-todo-react-native-expo

Criteria are keyed to user stories in `../requirements/user-stories.md`.

---

## US-001: view the todo list

**Given** two todos with titles `"Buy milk"` and `"Call dentist"` exist in AsyncStorage
**When** the list screen mounts
**Then**
- both titles are visible in the rendered list
- each item shows the correct `completed` state

**Given** one todo is marked completed and one is not
**When** the list screen renders
**Then**
- the completed item has a visible completed indicator (e.g., strikethrough or checkmark)
- the incomplete item does not

---

## US-002: see the empty state

**Given** AsyncStorage contains no todos
**When** the list screen mounts
**Then**
- no todo items are rendered
- an empty-state message is visible (e.g., "No todos yet")

---

## US-003: add a todo

**Given** the user is on the list screen
**When** the user opens the add screen, types `"Buy milk"`, and submits
**Then**
- the modal is dismissed
- `"Buy milk"` appears on the list screen without a full app reload
- a subsequent app restart still shows `"Buy milk"` (AsyncStorage was written)

**Given** the user submits a title with surrounding whitespace (e.g., `"  Buy milk  "`)
**When** the todo is created
**Then**
- the stored title is `"Buy milk"` (trimmed)
- the trimmed title is displayed on the list screen

---

## US-004: reject an empty or whitespace-only title

**Given** the user is on the add screen
**When** the user submits with an empty title field
**Then**
- the modal is not dismissed
- an inline error message is visible (e.g., "Title is required")
- no todo is added to the list

**When** the user submits with a whitespace-only title (e.g., `"   "`)
**Then**
- same behavior as empty title above

**When** the user submits with a title exceeding 200 characters
**Then**
- the modal is not dismissed
- an inline error message mentions the length limit
- no todo is added to the list

---

## US-005: toggle a todo's completion

**Given** a todo with `completed: false` exists on the list screen
**When** the user taps the completion toggle for that item
**Then**
- `completed` changes to `true` in the rendered list
- the visual indicator changes to show completion
- a subsequent app restart shows the todo as completed (AsyncStorage was written)

**Given** a todo with `completed: true` exists on the list screen
**When** the user taps the completion toggle
**Then**
- `completed` changes to `false`
- the visual indicator changes to show incomplete

---

## US-006: delete a todo

**Given** a todo with title `"Buy milk"` exists on the list screen
**When** the user taps the delete control for that item
**Then**
- `"Buy milk"` is removed from the list immediately
- a subsequent app restart does not show `"Buy milk"` (AsyncStorage was updated)

---

## US-007: persist todos across app restarts

**Given** the user has created todos `"Buy milk"` and `"Call dentist"`
**When** the app is fully closed and relaunched
**Then**
- both todos are present on the list screen
- their `completed` states are preserved

**Given** the user deleted `"Buy milk"` and toggled `"Call dentist"` to completed
**When** the app is fully closed and relaunched
**Then**
- `"Buy milk"` is not present
- `"Call dentist"` is present and marked completed

---

## US-008: use the app on iOS, Android, and Web

**Given** the app is started with `npx expo start`
**When** the developer opens the app in Expo Go on an iOS simulator
**Then**
- the list screen renders without a red error screen
- add, toggle, and delete all function correctly

**When** the developer opens the app on an Android emulator
**Then**
- same behavior as iOS above

**When** the developer opens the app in a browser via `--web`
**Then**
- the list screen renders in a browser window
- add, toggle, and delete all function correctly
- Web-specific AsyncStorage (localStorage shim) is used transparently
