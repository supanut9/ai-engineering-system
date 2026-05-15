package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"example.com/my-service/internal/adapters/inbound/http/handlers"
)

type stubHealthPort struct{}

func (s *stubHealthPort) Check() string { return "ok" }

func TestHealthHandler_Get(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	h := handlers.NewHealthHandler(&stubHealthPort{})
	r.GET("/healthz", h.Get)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/healthz", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var body map[string]string
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if body["status"] != "ok" {
		t.Errorf("expected status %q, got %q", "ok", body["status"])
	}
}
