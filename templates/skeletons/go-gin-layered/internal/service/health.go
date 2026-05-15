package service

// HealthService implements health-check application logic.
type HealthService struct{}

// NewHealthService returns a new HealthService.
func NewHealthService() *HealthService {
	return &HealthService{}
}

// Status returns the current health status string.
func (s *HealthService) Status() string {
	return "ok"
}
