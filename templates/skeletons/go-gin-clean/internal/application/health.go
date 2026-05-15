package application

import "example.com/my-service/internal/domain"

// HealthUseCase implements the health-check application use case.
type HealthUseCase struct{}

// NewHealthUseCase returns a new HealthUseCase.
func NewHealthUseCase() *HealthUseCase {
	return &HealthUseCase{}
}

// Check returns the current health status.
func (u *HealthUseCase) Check() domain.HealthStatus {
	return domain.HealthStatus{Status: "ok"}
}
