import { NextRequest, NextResponse } from "next/server";
import { getSingletonRepo } from "@/lib/repo";
import { updateTodo, deleteTodo } from "@/services/todos";
import { validateUpdateInput, ValidationError } from "@/types/todo";

const repo = getSingletonRepo();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: unknown = await req.json();
    const input = validateUpdateInput(body);
    const todo = updateTodo(repo, id, input);
    return NextResponse.json(todo);
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof Error && err.message.includes("not found")) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteTodo(repo, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
