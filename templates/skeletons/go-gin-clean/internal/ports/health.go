package ports

import "example.com/my-service/internal/domain"

// HealthUseCase is the inward-facing contract for health-check use cases.
type HealthUseCase interface {
	Check() domain.HealthStatus
}
