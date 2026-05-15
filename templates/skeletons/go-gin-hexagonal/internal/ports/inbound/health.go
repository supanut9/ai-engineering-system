package inbound

// HealthPort is the inbound port contract for health-check interactions.
type HealthPort interface {
	Check() string
}
