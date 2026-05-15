package handlers_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

// helpers

func doRequest(t *testing.T, method, path string, body interface{}) *httptest.ResponseRecorder {
	t.Helper()
	r := newTestEngine()
	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatalf("encode body: %v", err)
		}
	}
	req, _ := http.NewRequest(method, path, &buf)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func decodeBody(t *testing.T, w *httptest.ResponseRecorder) map[string]interface{} {
	t.Helper()
	var m map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&m); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	return m
}

// createOne is a helper that creates a single todo and returns its ID.
func createOne(t *testing.T, r interface {
	ServeHTTP(http.ResponseWriter, *http.Request)
}, title string) string {
	t.Helper()
	var buf bytes.Buffer
	_ = json.NewEncoder(&buf).Encode(map[string]string{"title": title})
	req, _ := http.NewRequest(http.MethodPost, "/v1/todos", &buf)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("createOne: expected 201 got %d: %s", w.Code, w.Body.String())
	}
	var body map[string]interface{}
	_ = json.NewDecoder(w.Body).Decode(&body)
	return body["id"].(string)
}

// --- POST /v1/todos ---

func TestCreateTodo_HappyPath(t *testing.T) {
	w := doRequest(t, http.MethodPost, "/v1/todos", map[string]string{"title": "buy milk"})
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
	}
	body := decodeBody(t, w)
	if body["id"] == nil || body["id"] == "" {
		t.Error("expected non-empty id")
	}
	if body["title"] != "buy milk" {
		t.Errorf("title mismatch: %v", body["title"])
	}
	if body["completed"] != false {
		t.Errorf("expected completed=false, got %v", body["completed"])
	}
}

func TestCreateTodo_EmptyTitle(t *testing.T) {
	w := doRequest(t, http.MethodPost, "/v1/todos", map[string]string{"title": ""})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
	body := decodeBody(t, w)
	errObj, _ := body["error"].(map[string]interface{})
	if errObj["code"] != "validation_error" {
		t.Errorf("expected validation_error, got %v", errObj["code"])
	}
}

func TestCreateTodo_InvalidJSON(t *testing.T) {
	r := newTestEngine()
	req, _ := http.NewRequest(http.MethodPost, "/v1/todos", bytes.NewBufferString(`not-json`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for invalid JSON, got %d", w.Code)
	}
}

// --- GET /v1/todos ---

func TestListTodos_Empty(t *testing.T) {
	w := doRequest(t, http.MethodGet, "/v1/todos", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	body := decodeBody(t, w)
	items, _ := body["items"].([]interface{})
	if len(items) != 0 {
		t.Errorf("expected empty items, got %d", len(items))
	}
}

func TestListTodos_WithItems(t *testing.T) {
	r := newTestEngine()

	// Create two todos using the same engine instance.
	for _, title := range []string{"first", "second"} {
		createOne(t, r, title)
	}

	req, _ := http.NewRequest(http.MethodGet, "/v1/todos", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var body map[string]interface{}
	_ = json.NewDecoder(w.Body).Decode(&body)
	items, _ := body["items"].([]interface{})
	if len(items) != 2 {
		t.Errorf("expected 2 items, got %d", len(items))
	}
}

// --- GET /v1/todos/:id ---

func TestGetTodo_HappyPath(t *testing.T) {
	r := newTestEngine()
	id := createOne(t, r, "get me")

	req, _ := http.NewRequest(http.MethodGet, "/v1/todos/"+id, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var body map[string]interface{}
	_ = json.NewDecoder(w.Body).Decode(&body)
	if body["id"] != id {
		t.Errorf("id mismatch: want %q got %v", id, body["id"])
	}
}

func TestGetTodo_NotFound(t *testing.T) {
	w := doRequest(t, http.MethodGet, "/v1/todos/nonexistent", nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", w.Code)
	}
	body := decodeBody(t, w)
	errObj, _ := body["error"].(map[string]interface{})
	if errObj["code"] != "not_found" {
		t.Errorf("expected not_found, got %v", errObj["code"])
	}
}

// --- PATCH /v1/todos/:id ---

func TestUpdateTodo_HappyPath(t *testing.T) {
	r := newTestEngine()
	id := createOne(t, r, "original")

	var buf bytes.Buffer
	_ = json.NewEncoder(&buf).Encode(map[string]interface{}{"title": "updated", "completed": true})
	req, _ := http.NewRequest(http.MethodPatch, "/v1/todos/"+id, &buf)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	var body map[string]interface{}
	_ = json.NewDecoder(w.Body).Decode(&body)
	if body["title"] != "updated" {
		t.Errorf("title not updated: %v", body["title"])
	}
	if body["completed"] != true {
		t.Errorf("completed not updated: %v", body["completed"])
	}
}

func TestUpdateTodo_NotFound(t *testing.T) {
	w := doRequest(t, http.MethodPatch, "/v1/todos/ghost", map[string]string{"title": "x"})
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", w.Code)
	}
}

func TestUpdateTodo_ClearDueAt(t *testing.T) {
	r := newTestEngine()

	// Create todo with due_at.
	var buf bytes.Buffer
	_ = json.NewEncoder(&buf).Encode(map[string]interface{}{
		"title":  "task",
		"due_at": "2026-12-31T00:00:00Z",
	})
	req, _ := http.NewRequest(http.MethodPost, "/v1/todos", &buf)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	var created map[string]interface{}
	_ = json.NewDecoder(w.Body).Decode(&created)
	id := created["id"].(string)

	// Patch with due_at: null to clear it.
	buf.Reset()
	buf.WriteString(`{"due_at":null}`)
	req, _ = http.NewRequest(http.MethodPatch, fmt.Sprintf("/v1/todos/%s", id), &buf)
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	var body map[string]interface{}
	_ = json.NewDecoder(w.Body).Decode(&body)
	if body["due_at"] != nil {
		t.Errorf("expected due_at=null, got %v", body["due_at"])
	}
}

// --- DELETE /v1/todos/:id ---

func TestDeleteTodo_HappyPath(t *testing.T) {
	r := newTestEngine()
	id := createOne(t, r, "delete me")

	req, _ := http.NewRequest(http.MethodDelete, "/v1/todos/"+id, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", w.Code)
	}

	// Confirm it is gone.
	req, _ = http.NewRequest(http.MethodGet, "/v1/todos/"+id, nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404 after delete, got %d", w.Code)
	}
}

func TestDeleteTodo_NotFound(t *testing.T) {
	w := doRequest(t, http.MethodDelete, "/v1/todos/ghost", nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", w.Code)
	}
}
