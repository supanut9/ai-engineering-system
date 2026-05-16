"use client";

import { useState } from "react";
import { Todo } from "@/types/todo";
import { TodoItem } from "./TodoItem";
import { AddTodoForm } from "./AddTodoForm";

interface TodoListProps {
  initialTodos: Todo[];
}

export function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(title: string) {
    setError(null);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to create todo");
      return;
    }
    const todo = (await res.json()) as Todo;
    setTodos((prev) => [...prev, todo]);
  }

  async function handleToggle(id: string, completed: boolean) {
    setError(null);
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) {
      setError("Failed to update todo");
      return;
    }
    const updated = (await res.json()) as Todo;
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete todo");
      return;
    }
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <AddTodoForm onAdd={handleAdd} />
      {error && (
        <p role="alert" style={{ color: "red", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}
      {todos.length === 0 ? (
        <p style={{ color: "#666", marginTop: "1rem" }}>No todos yet. Add one above.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
