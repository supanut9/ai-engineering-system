package health

// Service is the core health-check business service.
// It implements ports/inbound.HealthPort.
type Service struct{}

// NewService returns a new health Service.
func NewService() *Service {
	return &Service{}
}

// Check returns the current health status.
func (s *Service) Check() string {
	return "ok"
}
