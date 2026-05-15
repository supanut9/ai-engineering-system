package todo

import (
	"context"
	"strings"
	"time"

	"example.com/hello-todo-go/internal/ports/inbound"
)

// Service implements inbound.TodoService and owns all business-logic validation.
type Service struct {
	repo Repository
}

// NewService constructs a Service wired to the given repository.
func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func toItem(t *Todo) *inbound.TodoItem {
	return &inbound.TodoItem{
		ID:        t.ID,
		Title:     t.Title,
		Completed: t.Completed,
		DueAt:     t.DueAt,
		CreatedAt: t.CreatedAt,
		UpdatedAt: t.UpdatedAt,
	}
}

func (s *Service) Create(ctx context.Context, input inbound.CreateInput) (*inbound.TodoItem, error) {
	t, err := NewTodo(input.Title, input.DueAt)
	if err != nil {
		return nil, err
	}
	if err := s.repo.Save(ctx, t); err != nil {
		return nil, err
	}
	return toItem(t), nil
}

func (s *Service) List(ctx context.Context) ([]*inbound.TodoItem, error) {
	todos, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]*inbound.TodoItem, len(todos))
	for i, t := range todos {
		items[i] = toItem(t)
	}
	return items, nil
}

func (s *Service) Get(ctx context.Context, id string) (*inbound.TodoItem, error) {
	t, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toItem(t), nil
}

func (s *Service) Update(ctx context.Context, id string, patch inbound.Patch) (*inbound.TodoItem, error) {
	t, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if patch.Title != nil {
		title := strings.TrimSpace(*patch.Title)
		if title == "" {
			return nil, ErrTitleRequired
		}
		if len(title) > 200 {
			return nil, ErrTitleTooLong
		}
		t.Title = title
	}

	switch {
	case patch.ClearDueAt:
		t.DueAt = nil
	case patch.DueAt != nil:
		due := patch.DueAt.UTC()
		t.DueAt = &due
	}

	if patch.Completed != nil {
		t.Completed = *patch.Completed
	}

	t.UpdatedAt = time.Now().UTC()

	if err := s.repo.Save(ctx, t); err != nil {
		return nil, err
	}
	return toItem(t), nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
