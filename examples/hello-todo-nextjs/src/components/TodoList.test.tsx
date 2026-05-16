import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TodoList } from "./TodoList";
import type { Todo } from "@/types/todo";

const mockTodos: Todo[] = [
  {
    id: "1",
    title: "buy milk",
    completed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "walk dog",
    completed: true,
    createdAt: "2026-01-01T00:01:00.000Z",
  },
];

function makeFetchMock(overrides: Partial<Record<string, unknown>> = {}) {
  return vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    const method = opts?.method ?? "GET";

    // POST /api/todos
    if (method === "POST" && (url as string).endsWith("/api/todos")) {
      const newTodo: Todo = {
        id: "3",
        title: "new todo",
        completed: false,
        createdAt: new Date().toISOString(),
      };
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(overrides.postTodo ?? newTodo),
      });
    }

    // PATCH /api/todos/:id
    if (method === "PATCH") {
      const body = JSON.parse(opts?.body as string) as { completed?: boolean; title?: string };
      const id = (url as string).split("/").pop()!;
      const existing = mockTodos.find((t) => t.id === id);
      const updated = { ...existing, ...body };
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(updated),
      });
    }

    // DELETE /api/todos/:id
    if (method === "DELETE") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }

    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("TodoList", () => {
  it("renders initial todos", () => {
    global.fetch = makeFetchMock();
    render(<TodoList initialTodos={mockTodos} />);
    expect(screen.getByText("buy milk")).toBeInTheDocument();
    expect(screen.getByText("walk dog")).toBeInTheDocument();
  });

  it("shows empty state when no todos", () => {
    global.fetch = makeFetchMock();
    render(<TodoList initialTodos={[]} />);
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it("toggles a todo completed state on checkbox click", async () => {
    global.fetch = makeFetchMock();
    render(<TodoList initialTodos={mockTodos} />);

    const checkbox = screen.getByLabelText(/mark "buy milk" as complete/i);
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/todos/1",
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  it("deletes a todo on delete button click", async () => {
    global.fetch = makeFetchMock();
    render(<TodoList initialTodos={mockTodos} />);

    const deleteBtn = screen.getByLabelText(/delete "buy milk"/i);
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/todos/1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
    await waitFor(() => {
      expect(screen.queryByText("buy milk")).not.toBeInTheDocument();
    });
  });
});
