import { createTodo, listTodos, updateTodo, deleteTodo } from "./todos";
import { Todo, ValidationError } from "@/types/todo";

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "test-id",
    title: "Test todo",
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("createTodo", () => {
  it("creates a todo with the given title", () => {
    const { todos, todo } = createTodo([], { title: "Buy milk" });
    expect(todos).toHaveLength(1);
    expect(todo.title).toBe("Buy milk");
    expect(todo.completed).toBe(false);
    expect(todo.id).toBeTruthy();
    expect(todo.createdAt).toBeTruthy();
  });

  it("trims whitespace from title", () => {
    const { todo } = createTodo([], { title: "  Buy milk  " });
    expect(todo.title).toBe("Buy milk");
  });

  it("appends to existing todos without mutating original array", () => {
    const existing = [makeTodo({ id: "1" })];
    const { todos } = createTodo(existing, { title: "New" });
    expect(todos).toHaveLength(2);
    expect(existing).toHaveLength(1); // original untouched
  });

  it("throws ValidationError for empty title", () => {
    expect(() => createTodo([], { title: "" })).toThrow(ValidationError);
  });

  it("throws ValidationError for whitespace-only title", () => {
    expect(() => createTodo([], { title: "   " })).toThrow(ValidationError);
  });

  it("throws ValidationError for title exceeding 200 chars", () => {
    expect(() => createTodo([], { title: "a".repeat(201) })).toThrow(ValidationError);
  });
});

describe("listTodos", () => {
  it("returns a copy of the todos array", () => {
    const todos = [makeTodo({ id: "1" }), makeTodo({ id: "2" })];
    const result = listTodos(todos);
    expect(result).toHaveLength(2);
    expect(result).not.toBe(todos); // different reference
  });

  it("returns empty array when no todos", () => {
    expect(listTodos([])).toEqual([]);
  });
});

describe("updateTodo", () => {
  it("toggles completed", () => {
    const todos = [makeTodo({ id: "1", completed: false })];
    const { todos: next, todo } = updateTodo(todos, "1", { completed: true });
    expect(todo?.completed).toBe(true);
    expect(next[0].completed).toBe(true);
  });

  it("updates title", () => {
    const todos = [makeTodo({ id: "1", title: "Old" })];
    const { todo } = updateTodo(todos, "1", { title: "New" });
    expect(todo?.title).toBe("New");
  });

  it("returns null todo when id not found", () => {
    const { todo } = updateTodo([], "missing", { completed: true });
    expect(todo).toBeNull();
  });

  it("does not mutate other todos", () => {
    const todos = [makeTodo({ id: "1" }), makeTodo({ id: "2" })];
    const { todos: next } = updateTodo(todos, "1", { completed: true });
    expect(next[1]).toEqual(todos[1]);
  });
});

describe("deleteTodo", () => {
  it("removes the todo by id", () => {
    const todos = [makeTodo({ id: "1" }), makeTodo({ id: "2" })];
    const { todos: next, deleted } = deleteTodo(todos, "1");
    expect(deleted).toBe(true);
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe("2");
  });

  it("returns deleted=false when id not found", () => {
    const { deleted } = deleteTodo([], "missing");
    expect(deleted).toBe(false);
  });
});
