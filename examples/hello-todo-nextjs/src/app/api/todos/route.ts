import { NextRequest, NextResponse } from "next/server";
import { getSingletonRepo } from "@/lib/repo";
import { listTodos, createTodo } from "@/services/todos";
import { validateCreateInput, ValidationError } from "@/types/todo";

const repo = getSingletonRepo();

export async function GET() {
  const todos = listTodos(repo);
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const input = validateCreateInput(body);
    const todo = createTodo(repo, input);
    return NextResponse.json(todo, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
