"use client";

import { Todo } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 0",
        borderBottom: "1px solid #eee",
      }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
      />
      <span
        style={{
          flex: 1,
          textDecoration: todo.completed ? "line-through" : "none",
          color: todo.completed ? "#999" : "inherit",
        }}
      >
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.title}"`}
        style={{
          background: "none",
          border: "1px solid #ccc",
          borderRadius: 4,
          cursor: "pointer",
          padding: "0.2rem 0.5rem",
          color: "#c00",
        }}
      >
        Delete
      </button>
    </li>
  );
}
