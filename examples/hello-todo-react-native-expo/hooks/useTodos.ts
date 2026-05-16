import { useState, useEffect, useCallback } from "react";
import { Todo } from "@/types/todo";
import { createTodo, updateTodo, deleteTodo } from "@/services/todos";
import { loadTodos, saveTodos } from "@/lib/storage";

interface UseTodosResult {
  todos: Todo[];
  loading: boolean;
  add: (title: string) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useTodos(): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos().then((loaded) => {
      setTodos(loaded);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: Todo[]) => {
    setTodos(next);
    await saveTodos(next);
  }, []);

  const add = useCallback(
    async (title: string) => {
      const { todos: next } = createTodo(todos, { title });
      await persist(next);
    },
    [todos, persist]
  );

  const toggle = useCallback(
    async (id: string) => {
      const target = todos.find((t) => t.id === id);
      if (!target) return;
      const { todos: next } = updateTodo(todos, id, { completed: !target.completed });
      await persist(next);
    },
    [todos, persist]
  );

  const remove = useCallback(
    async (id: string) => {
      const { todos: next } = deleteTodo(todos, id);
      await persist(next);
    },
    [todos, persist]
  );

  return { todos, loading, add, toggle, remove };
}
