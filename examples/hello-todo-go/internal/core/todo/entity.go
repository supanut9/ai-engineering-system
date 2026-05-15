package todo

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strings"
	"time"
)

var (
	ErrTitleRequired = errors.New("title is required")
	ErrTitleTooLong  = errors.New("title must not exceed 200 characters")
)

// Todo is the core domain entity.
type Todo struct {
	ID        string
	Title     string
	Completed bool
	DueAt     *time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}

// NewTodo validates inputs, generates an id, and returns a ready-to-store Todo.
func NewTodo(title string, dueAt *time.Time) (*Todo, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		return nil, ErrTitleRequired
	}
	if len(title) > 200 {
		return nil, ErrTitleTooLong
	}

	id, err := generateID()
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	var due *time.Time
	if dueAt != nil {
		t := dueAt.UTC()
		due = &t
	}

	return &Todo{
		ID:        id,
		Title:     title,
		Completed: false,
		DueAt:     due,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// generateID produces a 32-char hex string from 16 random bytes.
func generateID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
