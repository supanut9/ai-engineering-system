package todo_test

import (
	"context"
	"strings"
	"testing"
	"time"

	"example.com/hello-todo-go/internal/core/todo"
	"example.com/hello-todo-go/internal/ports/inbound"
)

// memRepo is a minimal in-process repository used only inside this test file.
type memRepo struct {
	items map[string]*todo.Todo
	order []string
}

func newMemRepo() *memRepo {
	return &memRepo{items: make(map[string]*todo.Todo)}
}

func (r *memRepo) Save(_ context.Context, t *todo.Todo) error {
	if _, exists := r.items[t.ID]; !exists {
		r.order = append(r.order, t.ID)
	}
	cp := *t
	r.items[t.ID] = &cp
	return nil
}

func (r *memRepo) FindAll(_ context.Context) ([]*todo.Todo, error) {
	result := make([]*todo.Todo, 0, len(r.order))
	for _, id := range r.order {
		cp := *r.items[id]
		result = append(result, &cp)
	}
	return result, nil
}

func (r *memRepo) FindByID(_ context.Context, id string) (*todo.Todo, error) {
	t, ok := r.items[id]
	if !ok {
		return nil, todo.ErrNotFound
	}
	cp := *t
	return &cp, nil
}

func (r *memRepo) Delete(_ context.Context, id string) error {
	if _, ok := r.items[id]; !ok {
		return todo.ErrNotFound
	}
	delete(r.items, id)
	newOrder := r.order[:0]
	for _, oid := range r.order {
		if oid != id {
			newOrder = append(newOrder, oid)
		}
	}
	r.order = newOrder
	return nil
}

func newSvc() *todo.Service {
	return todo.NewService(newMemRepo())
}

func strPtr(s string) *string { return &s }
func boolPtr(b bool) *bool    { return &b }

// --- tests ---

func TestCreate_HappyPath(t *testing.T) {
	svc := newSvc()
	got, err := svc.Create(context.Background(), inbound.CreateInput{Title: "buy milk"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.ID == "" {
		t.Error("expected non-empty id")
	}
	if got.Title != "buy milk" {
		t.Errorf("title mismatch: got %q", got.Title)
	}
	if got.Completed {
		t.Error("new todo must not be completed")
	}
}

func TestCreate_EmptyTitle(t *testing.T) {
	svc := newSvc()
	_, err := svc.Create(context.Background(), inbound.CreateInput{Title: ""})
	if err == nil {
		t.Fatal("expected error for empty title")
	}
}

func TestCreate_WhitespaceOnlyTitle(t *testing.T) {
	svc := newSvc()
	_, err := svc.Create(context.Background(), inbound.CreateInput{Title: "   "})
	if err == nil {
		t.Fatal("expected error for whitespace-only title")
	}
}

func TestCreate_TitleTooLong(t *testing.T) {
	svc := newSvc()
	_, err := svc.Create(context.Background(), inbound.CreateInput{Title: strings.Repeat("x", 201)})
	if err == nil {
		t.Fatal("expected error for 201-char title")
	}
}

func TestGet_UnknownID(t *testing.T) {
	svc := newSvc()
	_, err := svc.Get(context.Background(), "no-such-id")
	if err == nil {
		t.Fatal("expected not-found error")
	}
}

func TestUpdate_UnknownID(t *testing.T) {
	svc := newSvc()
	_, err := svc.Update(context.Background(), "no-such-id", inbound.Patch{})
	if err == nil {
		t.Fatal("expected not-found error")
	}
}

func TestDelete_UnknownID(t *testing.T) {
	svc := newSvc()
	err := svc.Delete(context.Background(), "no-such-id")
	if err == nil {
		t.Fatal("expected not-found error")
	}
}

func TestUpdate_SetsCompletedAndAdvancesUpdatedAt(t *testing.T) {
	svc := newSvc()
	created, err := svc.Create(context.Background(), inbound.CreateInput{Title: "task"})
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	before := created.UpdatedAt
	time.Sleep(2 * time.Millisecond)

	updated, err := svc.Update(context.Background(), created.ID, inbound.Patch{
		Completed: boolPtr(true),
	})
	if err != nil {
		t.Fatalf("update: %v", err)
	}
	if !updated.Completed {
		t.Error("expected completed=true")
	}
	if !updated.UpdatedAt.After(before) {
		t.Errorf("updated_at did not advance: before=%v after=%v", before, updated.UpdatedAt)
	}
}

// TestList_InsertionOrder documents that List returns todos in insertion order.
func TestList_InsertionOrder(t *testing.T) {
	svc := newSvc()
	titles := []string{"alpha", "beta", "gamma"}
	for _, title := range titles {
		if _, err := svc.Create(context.Background(), inbound.CreateInput{Title: title}); err != nil {
			t.Fatalf("create %q: %v", title, err)
		}
	}
	items, err := svc.List(context.Background())
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(items) != 3 {
		t.Fatalf("expected 3 items, got %d", len(items))
	}
	for i, title := range titles {
		if items[i].Title != title {
			t.Errorf("position %d: want %q got %q", i, title, items[i].Title)
		}
	}
}

func TestUpdate_TitleValidation(t *testing.T) {
	svc := newSvc()
	created, _ := svc.Create(context.Background(), inbound.CreateInput{Title: "original"})

	_, err := svc.Update(context.Background(), created.ID, inbound.Patch{Title: strPtr("   ")})
	if err == nil {
		t.Fatal("expected error for whitespace-only title patch")
	}

	_, err = svc.Update(context.Background(), created.ID, inbound.Patch{Title: strPtr(strings.Repeat("x", 201))})
	if err == nil {
		t.Fatal("expected error for 201-char title patch")
	}
}
