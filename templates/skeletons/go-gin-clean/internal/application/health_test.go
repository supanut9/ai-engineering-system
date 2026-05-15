package application_test

import (
	"testing"

	"example.com/my-service/internal/application"
)

func TestHealthUseCase_Check(t *testing.T) {
	uc := application.NewHealthUseCase()
	got := uc.Check()
	if got.Status != "ok" {
		t.Errorf("expected status %q, got %q", "ok", got.Status)
	}
}
