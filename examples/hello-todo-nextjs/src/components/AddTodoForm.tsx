"use client";

import { useState, FormEvent } from "react";

interface AddTodoFormProps {
  onAdd: (title: string) => Promise<void>;
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setLoading(true);
    await onAdd(trimmed);
    setTitle("");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
      <label htmlFor="new-todo-input" style={{ display: "none" }}>
        New todo title
      </label>
      <input
        id="new-todo-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        disabled={loading}
        style={{ flex: 1, padding: "0.4rem 0.6rem", fontSize: "1rem" }}
      />
      <button
        type="submit"
        disabled={loading || title.trim() === ""}
        style={{
          padding: "0.4rem 1rem",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        {loading ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
