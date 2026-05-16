import { Todo } from "@/types/todo";

// In-memory repository. The Map is module-level so it persists for the
// lifetime of the Node.js process (dev + prod). For tests each import of
// the service creates its own isolated instance via the exported factory.
const store = new Map<string, Todo>();

export interface TodoRepo {
  findAll(): Todo[];
  findById(id: string): Todo | undefined;
  save(todo: Todo): void;
  delete(id: string): boolean;
}

export function createMemoryRepo(): TodoRepo {
  const db = new Map<string, Todo>();
  return {
    findAll: () => Array.from(db.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    findById: (id) => db.get(id),
    save: (todo) => { db.set(todo.id, todo); },
    delete: (id) => db.delete(id),
  };
}

// Singleton repo used by route handlers at runtime.
let _singleton: TodoRepo | null = null;

export function getSingletonRepo(): TodoRepo {
  if (!_singleton) {
    _singleton = {
      findAll: () => Array.from(store.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      findById: (id) => store.get(id),
      save: (todo) => { store.set(todo.id, todo); },
      delete: (id) => store.delete(id),
    };
  }
  return _singleton;
}
