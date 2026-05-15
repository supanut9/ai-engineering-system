# user stories — hello-todo-fastapi

Stories are written from the perspective of a developer exercising the API directly
(e.g., via curl or an HTTP client). There is no end-user UI for v0.1.0.

Acceptance criteria for each story are in
`../requirements/acceptance-criteria.md`.

---

## US-001: create a todo with a title

As a developer using the API,
I want to POST a new todo with a title,
so that the item is stored and returned with a server-assigned id and timestamps.

---

## US-002: create a todo with an optional due date

As a developer using the API,
I want to include a `due_at` field when creating a todo,
so that the due date is persisted and returned in the response.

---

## US-003: list all todos

As a developer using the API,
I want to GET all todos in a single request,
so that I can see every item currently stored.

---

## US-004: get a single todo by id

As a developer using the API,
I want to GET a specific todo by its id,
so that I can retrieve the latest state of one item without fetching all todos.

---

## US-005: update a todo's fields

As a developer using the API,
I want to PATCH a todo with new values for `title`, `due_at`, or `completed`,
so that I can modify any subset of fields without resending unchanged ones.

---

## US-006: delete a todo

As a developer using the API,
I want to DELETE a todo by id,
so that items I no longer need are removed from the store.

---

## US-007: reject a todo with an empty or missing title

As a developer using the API,
I want the server to reject a create or update request where `title` is empty or absent,
so that the store never holds invalid todos.

---

## US-008: receive a 404 for operations on an unknown id

As a developer using the API,
I want GET, PATCH, and DELETE to return 404 when the specified id does not exist,
so that I can distinguish a missing resource from a server error.
