# user stories — hello-todo-react-native-expo

Stories are written from the perspective of a user interacting with the app on a device
or simulator.

Acceptance criteria for each story are in
`../requirements/acceptance-criteria.md`.

---

## US-001: view the todo list

As a user launching the app,
I want the list screen to show all my todos,
so that I can see what I need to do without any extra steps.

---

## US-002: see the empty state

As a user with no todos,
I want the list screen to display a helpful message when the list is empty,
so that I know the app is working and understand how to add my first item.

---

## US-003: add a todo

As a user on the list screen,
I want to open the add screen and enter a title,
so that the new todo is saved and appears on the list.

---

## US-004: reject an empty or whitespace-only title

As a user on the add screen,
I want the app to refuse to save a todo with no meaningful title,
so that the list never contains blank or whitespace-only items.

---

## US-005: toggle a todo's completion

As a user on the list screen,
I want to mark a todo as complete (or incomplete),
so that I can track which tasks are done.

---

## US-006: delete a todo

As a user on the list screen,
I want to delete a todo I no longer need,
so that the list stays relevant and uncluttered.

---

## US-007: persist todos across app restarts

As a user who closes and relaunches the app,
I want my todos to still be there,
so that I do not have to re-enter them after every session.

---

## US-008: use the app on iOS, Android, and Web

As a developer evaluating the example,
I want the app to function on all three Expo-supported targets,
so that I can see how the Expo managed workflow handles cross-platform behavior.
