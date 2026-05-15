package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"example.com/hello-todo-go/internal/core/todo"
	"example.com/hello-todo-go/internal/ports/inbound"
)

// Handler holds the inbound service dependency for all HTTP handlers.
type Handler struct {
	svc inbound.TodoService
}

// NewHandler constructs a Handler with the given service.
func NewHandler(svc inbound.TodoService) *Handler {
	return &Handler{svc: svc}
}

// todoResponse is the JSON shape for a single todo in responses.
type todoResponse struct {
	ID        string     `json:"id"`
	Title     string     `json:"title"`
	Completed bool       `json:"completed"`
	DueAt     *time.Time `json:"due_at"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

func toResponse(t *inbound.TodoItem) todoResponse {
	return todoResponse{
		ID:        t.ID,
		Title:     t.Title,
		Completed: t.Completed,
		DueAt:     t.DueAt,
		CreatedAt: t.CreatedAt,
		UpdatedAt: t.UpdatedAt,
	}
}

func errResponse(code, message string) gin.H {
	return gin.H{"error": gin.H{"code": code, "message": message}}
}

func mapServiceError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, todo.ErrNotFound):
		c.JSON(http.StatusNotFound, errResponse("not_found", "todo not found"))
	case errors.Is(err, todo.ErrTitleRequired), errors.Is(err, todo.ErrTitleTooLong):
		c.JSON(http.StatusBadRequest, errResponse("validation_error", err.Error()))
	default:
		c.JSON(http.StatusInternalServerError, errResponse("internal", "internal server error"))
	}
}

// createRequest is the body for POST /v1/todos.
type createRequest struct {
	Title string     `json:"title"`
	DueAt *time.Time `json:"due_at"`
}

func (h *Handler) CreateTodo(c *gin.Context) {
	var req createRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errResponse("validation_error", "invalid request body"))
		return
	}

	t, err := h.svc.Create(c.Request.Context(), inbound.CreateInput{
		Title: req.Title,
		DueAt: req.DueAt,
	})
	if err != nil {
		mapServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, toResponse(t))
}

func (h *Handler) ListTodos(c *gin.Context) {
	items, err := h.svc.List(c.Request.Context())
	if err != nil {
		mapServiceError(c, err)
		return
	}

	resp := make([]todoResponse, len(items))
	for i, t := range items {
		resp[i] = toResponse(t)
	}
	c.JSON(http.StatusOK, gin.H{"items": resp})
}

func (h *Handler) GetTodo(c *gin.Context) {
	id := c.Param("id")
	t, err := h.svc.Get(c.Request.Context(), id)
	if err != nil {
		mapServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, toResponse(t))
}

// parsePatch reads the raw JSON body and extracts a Patch, handling three states for due_at:
//   - absent: key not present
//   - null: explicit JSON null → sets ClearDueAt=true
//   - value: RFC3339 string → sets DueAt
func parsePatch(body []byte) (inbound.Patch, error) {
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(body, &raw); err != nil {
		return inbound.Patch{}, err
	}

	var patch inbound.Patch

	if v, ok := raw["title"]; ok {
		var s string
		if err := json.Unmarshal(v, &s); err != nil {
			return inbound.Patch{}, err
		}
		patch.Title = &s
	}

	if v, ok := raw["completed"]; ok {
		var b bool
		if err := json.Unmarshal(v, &b); err != nil {
			return inbound.Patch{}, err
		}
		patch.Completed = &b
	}

	if v, ok := raw["due_at"]; ok {
		if string(v) == "null" {
			patch.ClearDueAt = true
		} else {
			var t time.Time
			if err := json.Unmarshal(v, &t); err != nil {
				return inbound.Patch{}, err
			}
			patch.DueAt = &t
		}
	}

	return patch, nil
}

func (h *Handler) UpdateTodo(c *gin.Context) {
	id := c.Param("id")

	body, err := c.GetRawData()
	if err != nil || len(body) == 0 {
		c.JSON(http.StatusBadRequest, errResponse("validation_error", "invalid request body"))
		return
	}

	patch, err := parsePatch(body)
	if err != nil {
		c.JSON(http.StatusBadRequest, errResponse("validation_error", "invalid request body"))
		return
	}

	t, err := h.svc.Update(c.Request.Context(), id, patch)
	if err != nil {
		mapServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, toResponse(t))
}

func (h *Handler) DeleteTodo(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		mapServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
