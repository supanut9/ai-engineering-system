package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"example.com/hello-todo-go/internal/adapters/inbound/http/handlers"
	"example.com/hello-todo-go/internal/adapters/inbound/http/routes"
	"example.com/hello-todo-go/internal/adapters/outbound/memory"
	"example.com/hello-todo-go/internal/core/todo"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func newTestEngine() *gin.Engine {
	store := memory.NewStore()
	svc := todo.NewService(store)
	h := handlers.NewHandler(svc)
	r := gin.New()
	routes.Register(r, h)
	return r
}

func TestHealthz(t *testing.T) {
	r := newTestEngine()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/healthz", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var body map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body["status"] != "ok" {
		t.Errorf("expected status=ok, got %v", body["status"])
	}
}
