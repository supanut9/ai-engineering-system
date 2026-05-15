.PHONY: setup run test test-race test-integration lint fmt build smoke

setup:
	go mod tidy

run:
	go run ./cmd/api

test:
	go test ./...

test-race:
	go test -race ./...

test-integration: smoke

lint:
	gofmt -l . && go vet ./...

fmt:
	gofmt -w .

build:
	go build -o bin/api ./cmd/api

smoke: build
	@./bin/api & \
	API_PID=$$! ; \
	sleep 1 ; \
	echo "--- GET /healthz ---" ; \
	curl -sf http://localhost:8080/healthz ; \
	echo "" ; \
	echo "--- POST /v1/todos ---" ; \
	curl -sf -X POST -H 'Content-Type: application/json' \
		-d '{"title":"smoke test todo"}' http://localhost:8080/v1/todos ; \
	echo "" ; \
	echo "--- GET /v1/todos ---" ; \
	curl -sf http://localhost:8080/v1/todos ; \
	echo "" ; \
	kill $$API_PID ; \
	echo "smoke test passed"
