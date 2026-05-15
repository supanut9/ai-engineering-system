package memory_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"example.com/hello-todo-go/internal/adapters/outbound/memory"
	"example.com/hello-todo-go/internal/core/todo"
)

func makeTodo(title string) *todo.Todo {
	t, err := todo.NewTodo(title, nil)
	if err != nil {
		panic(err)
	}
	return t
}

func TestStore_SaveAndFindByID(t *testing.T) {
	store := memory.NewStore()
	ctx := context.Background()
	item := makeTodo("test todo")

	if err := store.Save(ctx, item); err != nil {
		t.Fatalf("Save: %v", err)
	}

	found, err := store.FindByID(ctx, item.ID)
	if err != nil {
		t.Fatalf("FindByID: %v", err)
	}
	if found.Title != item.Title {
		t.Errorf("title mismatch: want %q got %q", item.Title, found.Title)
	}
}

func TestStore_FindByID_NotFound(t *testing.T) {
	store := memory.NewStore()
	_, err := store.FindByID(context.Background(), "missing")
	if !errors.Is(err, todo.ErrNotFound) {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}

func TestStore_FindAll_InsertionOrder(t *testing.T) {
	store := memory.NewStore()
	ctx := context.Background()
	titles := []string{"first", "second", "third"}
	for _, title := range titles {
		if err := store.Save(ctx, makeTodo(title)); err != nil {
			t.Fatalf("Save %q: %v", title, err)
		}
	}

	all, err := store.FindAll(ctx)
	if err != nil {
		t.Fatalf("FindAll: %v", err)
	}
	if len(all) != 3 {
		t.Fatalf("expected 3, got %d", len(all))
	}
	for i, title := range titles {
		if all[i].Title != title {
			t.Errorf("position %d: want %q got %q", i, title, all[i].Title)
		}
	}
}

func TestStore_Delete_HappyPath(t *testing.T) {
	store := memory.NewStore()
	ctx := context.Background()
	item := makeTodo("delete me")
	_ = store.Save(ctx, item)

	if err := store.Delete(ctx, item.ID); err != nil {
		t.Fatalf("Delete: %v", err)
	}
	_, err := store.FindByID(ctx, item.ID)
	if !errors.Is(err, todo.ErrNotFound) {
		t.Error("expected ErrNotFound after delete")
	}
}

func TestStore_Delete_NotFound(t *testing.T) {
	store := memory.NewStore()
	err := store.Delete(context.Background(), "ghost")
	if !errors.Is(err, todo.ErrNotFound) {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}

func TestStore_Save_ReturnsIsolatedCopy(t *testing.T) {
	store := memory.NewStore()
	ctx := context.Background()
	item := makeTodo("original")
	_ = store.Save(ctx, item)

	// Mutate the original after save; FindByID must return the stored snapshot.
	item.Title = "mutated"

	found, _ := store.FindByID(ctx, item.ID)
	if found.Title == "mutated" {
		t.Error("store returned the same pointer; internal state is mutable")
	}
}

func TestStore_Save_UpdateExisting(t *testing.T) {
	store := memory.NewStore()
	ctx := context.Background()
	item := makeTodo("before")
	_ = store.Save(ctx, item)

	item.Title = "after"
	item.UpdatedAt = time.Now().UTC()
	_ = store.Save(ctx, item)

	found, _ := store.FindByID(ctx, item.ID)
	if found.Title != "after" {
		t.Errorf("expected updated title, got %q", found.Title)
	}

	all, _ := store.FindAll(ctx)
	if len(all) != 1 {
		t.Errorf("expected 1 item after update, got %d", len(all))
	}
}
