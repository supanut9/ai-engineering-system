package todo

import (
	"context"
	"errors"
)

// ErrNotFound is the sentinel returned by repository methods when a todo id does not exist.
var ErrNotFound = errors.New("todo not found")

// Repository is the outbound port that the service depends on.
// Adapters implement this interface; the core package owns the definition.
type Repository interface {
	Save(ctx context.Context, t *Todo) error
	FindAll(ctx context.Context) ([]*Todo, error)
	FindByID(ctx context.Context, id string) (*Todo, error)
	Delete(ctx context.Context, id string) error
}
