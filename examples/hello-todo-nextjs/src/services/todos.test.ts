import { describe, it, expect, beforeEach } from "vitest";
import { createMemoryRepo, TodoRepo } from "@/lib/repo";
import { listTodos, createTodo, updateTodo, deleteTodo } from "./todos";
import { ValidationError } from "@/types/todo";

let repo: TodoRepo;

beforeEach(() => {
  repo = createMemoryRepo();
});

describe("listTodos", () => {
  it("returns empty array when no todos", () => {
    expect(listTodos(repo)).toEqual([]);
  });

  it("returns created todos", () => {
    createTodo(repo, { title: "first" });
    createTodo(repo, { title: "second" });
    const todos = listTodos(repo);
    expect(todos).toHaveLength(2);
    expect(todos[0].title).toBe("first");
    expect(todos[1].title).toBe("second");
  });
});

describe("createTodo", () => {
  it("creates a todo with correct fields", () => {
    const todo = createTodo(repo, { title: "buy milk" });
    expect(todo.id).toBeTruthy();
    expect(todo.title).toBe("buy milk");
    expect(todo.completed).toBe(false);
    expect(todo.createdAt).toBeTruthy();
  });

  it("trims whitespace from title", () => {
    const todo = createTodo(repo, { title: "  walk dog  " });
    expect(todo.title).toBe("walk dog");
  });

  it("throws ValidationError for empty title", () => {
    expect(() => createTodo(repo, { title: "" })).toThrow(ValidationError);
  });

  it("throws ValidationError for whitespace-only title", () => {
    expect(() => createTodo(repo, { title: "   " })).toThrow(ValidationError);
  });
});

describe("updateTodo", () => {
  it("toggles completed", () => {
    const todo = createTodo(repo, { title: "read book" });
    const updated = updateTodo(repo, todo.id, { completed: true });
    expect(updated.completed).toBe(true);
    expect(updated.title).toBe("read book");
  });

  it("updates title", () => {
    const todo = createTodo(repo, { title: "read book" });
    const updated = updateTodo(repo, todo.id, { title: "read two books" });
    expect(updated.title).toBe("read two books");
    expect(updated.completed).toBe(false);
  });

  it("throws when todo not found", () => {
    expect(() => updateTodo(repo, "nonexistent-id", { completed: true })).toThrow(
      "not found"
    );
  });
});

describe("deleteTodo", () => {
  it("deletes an existing todo", () => {
    const todo = createTodo(repo, { title: "clean desk" });
    deleteTodo(repo, todo.id);
    expect(listTodos(repo)).toHaveLength(0);
  });

  it("throws when todo not found", () => {
    expect(() => deleteTodo(repo, "nonexistent-id")).toThrow("not found");
  });
});
