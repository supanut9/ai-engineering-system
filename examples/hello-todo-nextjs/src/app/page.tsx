import { getSingletonRepo } from "@/lib/repo";
import { listTodos } from "@/services/todos";
import { TodoList } from "@/components/TodoList";

// This is a React Server Component. It fetches the initial todos
// and passes them to the interactive client component.
export default function HomePage() {
  const repo = getSingletonRepo();
  const initialTodos = listTodos(repo);

  return (
    <main>
      <h1>Todo List</h1>
      <TodoList initialTodos={initialTodos} />
    </main>
  );
}
