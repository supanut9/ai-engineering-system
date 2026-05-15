package memory

import (
	"context"
	"sync"

	"example.com/hello-todo-go/internal/core/todo"
)

// Store is a thread-safe in-memory implementation of todo.Repository.
// It preserves insertion order for List operations.
type Store struct {
	mu    sync.RWMutex
	items map[string]*todo.Todo
	order []string
}

// NewStore returns an empty Store.
func NewStore() *Store {
	return &Store{items: make(map[string]*todo.Todo)}
}

func (s *Store) Save(_ context.Context, t *todo.Todo) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.items[t.ID]; !exists {
		s.order = append(s.order, t.ID)
	}
	// Store a copy so callers cannot mutate internal state through the pointer.
	cp := *t
	s.items[t.ID] = &cp
	return nil
}

func (s *Store) FindAll(_ context.Context) ([]*todo.Todo, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]*todo.Todo, 0, len(s.order))
	for _, id := range s.order {
		cp := *s.items[id]
		result = append(result, &cp)
	}
	return result, nil
}

func (s *Store) FindByID(_ context.Context, id string) (*todo.Todo, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	t, ok := s.items[id]
	if !ok {
		return nil, todo.ErrNotFound
	}
	cp := *t
	return &cp, nil
}

func (s *Store) Delete(_ context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.items[id]; !ok {
		return todo.ErrNotFound
	}
	delete(s.items, id)

	newOrder := s.order[:0]
	for _, oid := range s.order {
		if oid != id {
			newOrder = append(newOrder, oid)
		}
	}
	s.order = newOrder
	return nil
}
