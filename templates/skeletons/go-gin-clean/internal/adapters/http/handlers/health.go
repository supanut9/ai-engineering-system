package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"example.com/my-service/internal/ports"
)

// HealthHandler is the Gin delivery adapter for health-check.
type HealthHandler struct {
	uc ports.HealthUseCase
}

// NewHealthHandler returns a new HealthHandler wired to a HealthUseCase.
func NewHealthHandler(uc ports.HealthUseCase) *HealthHandler {
	return &HealthHandler{uc: uc}
}

// Get handles GET /healthz.
func (h *HealthHandler) Get(c *gin.Context) {
	result := h.uc.Check()
	c.JSON(http.StatusOK, gin.H{"status": result.Status})
}
