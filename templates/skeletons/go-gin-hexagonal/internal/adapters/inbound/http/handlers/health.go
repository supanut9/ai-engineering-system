package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"example.com/my-service/internal/ports/inbound"
)

// HealthHandler is the HTTP inbound adapter for health-check.
type HealthHandler struct {
	port inbound.HealthPort
}

// NewHealthHandler returns a new HealthHandler wired to an inbound port.
func NewHealthHandler(port inbound.HealthPort) *HealthHandler {
	return &HealthHandler{port: port}
}

// Get handles GET /healthz.
func (h *HealthHandler) Get(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": h.port.Check()})
}
