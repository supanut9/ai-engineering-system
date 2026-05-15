package service_test

import (
	"testing"

	"example.com/my-service/internal/service"
)

func TestHealthService_Status(t *testing.T) {
	svc := service.NewHealthService()
	got := svc.Status()
	if got != "ok" {
		t.Errorf("expected %q, got %q", "ok", got)
	}
}
