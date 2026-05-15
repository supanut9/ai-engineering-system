package inbound

import (
	"context"
	"time"
)

// TodoItem is the read-side data shape returned by service operations.
// It mirrors core/todo.Todo but is defined here to avoid import cycles.
type TodoItem struct {
	ID        string
	Title     string
	Completed bool
	DueAt     *time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}

// CreateInput holds validated fields for creating a new todo.
type CreateInput struct {
	Title string
	DueAt *time.Time
}

// Patch holds optional fields for a partial update.
// Title and Completed use pointers to distinguish "absent" from zero value.
// ClearDueAt signals that due_at should be set to null; DueAt holds the new value when non-nil.
type Patch struct {
	Title      *string
	DueAt      *time.Time
	ClearDueAt bool
	Completed  *bool
}

// TodoService is the inbound port implemented by the core service.
type TodoService interface {
	Create(ctx context.Context, input CreateInput) (*TodoItem, error)
	List(ctx context.Context) ([]*TodoItem, error)
	Get(ctx context.Context, id string) (*TodoItem, error)
	Update(ctx context.Context, id string, patch Patch) (*TodoItem, error)
	Delete(ctx context.Context, id string) error
}
