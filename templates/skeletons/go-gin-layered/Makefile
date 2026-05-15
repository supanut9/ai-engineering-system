.PHONY: setup run test lint fmt

setup:
	go mod tidy

run:
	go run ./cmd/api

test:
	go test ./...

lint:
	gofmt -l . && go vet ./...

fmt:
	gofmt -w .
