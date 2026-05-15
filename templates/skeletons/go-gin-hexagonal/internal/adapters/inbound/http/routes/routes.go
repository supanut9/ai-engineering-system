package routes

import (
	"github.com/gin-gonic/gin"

	"example.com/my-service/internal/adapters/inbound/http/handlers"
)

// Register wires all application routes onto the given engine.
func Register(r *gin.Engine, health *handlers.HealthHandler) {
	r.GET("/healthz", health.Get)
}
