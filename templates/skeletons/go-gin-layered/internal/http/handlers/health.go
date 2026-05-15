package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// HealthService defines the contract the handler depends on.
type HealthService interface {
	Status() string
}

// HealthHandler handles health-check requests.
type HealthHandler struct {
	svc HealthService
}

// NewHealthHandler returns a new HealthHandler wired to the given service.
func NewHealthHandler(svc HealthService) *HealthHandler {
	return &HealthHandler{svc: svc}
}

// Get handles GET /healthz.
func (h *HealthHandler) Get(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": h.svc.Status()})
}
