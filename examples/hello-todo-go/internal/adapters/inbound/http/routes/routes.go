package routes

import (
	"github.com/gin-gonic/gin"

	"example.com/hello-todo-go/internal/adapters/inbound/http/handlers"
)

// Register wires all application routes onto the given engine.
func Register(r *gin.Engine, h *handlers.Handler) {
	r.GET("/healthz", h.Healthz)

	v1 := r.Group("/v1")
	{
		v1.POST("/todos", h.CreateTodo)
		v1.GET("/todos", h.ListTodos)
		v1.GET("/todos/:id", h.GetTodo)
		v1.PATCH("/todos/:id", h.UpdateTodo)
		v1.DELETE("/todos/:id", h.DeleteTodo)
	}
}
