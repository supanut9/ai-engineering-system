// Package outbound provides the outbound port types that storage adapters implement.
// The canonical Repository interface and ErrNotFound sentinel are defined in core/todo
// and re-exported here so adapter packages can reference a single stable import path.
package outbound

import (
	"example.com/hello-todo-go/internal/core/todo"
)

// Repository is the outbound storage interface. Adapters implement this.
// It is an alias of todo.Repository so callers may use either import path.
type Repository = todo.Repository

// ErrNotFound is returned when a requested todo does not exist.
// It is the same sentinel as todo.ErrNotFound.
var ErrNotFound = todo.ErrNotFound
