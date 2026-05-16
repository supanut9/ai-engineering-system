.PHONY: setup run test test-integration lint lint-fix fmt build clean

setup:
	cargo fetch

run:
	cargo run --bin api

test:
	cargo test --all-features

test-integration:
	@cargo build --bin api 2>/dev/null
	@./target/debug/api & \
	API_PID=$$! ; \
	sleep 1 ; \
	echo "--- GET /healthz ---" ; \
	curl -sf http://localhost:8080/healthz ; \
	echo "" ; \
	echo "--- POST /v1/todos ---" ; \
	ID=$$(curl -sf -X POST -H 'Content-Type: application/json' \
		-d '{"title":"smoke test todo"}' http://localhost:8080/v1/todos | grep -o '"id":"[^"]*"' | cut -d'"' -f4) ; \
	echo "created id: $$ID" ; \
	echo "--- GET /v1/todos ---" ; \
	curl -sf http://localhost:8080/v1/todos ; \
	echo "" ; \
	kill $$API_PID ; \
	echo "integration test passed"

lint:
	cargo fmt --all -- --check
	cargo clippy --all-targets --all-features -- -D warnings

lint-fix:
	cargo fmt --all
	cargo clippy --all-targets --all-features --fix --allow-dirty --allow-staged

fmt:
	cargo fmt --all

build:
	cargo build --release --bin api

clean:
	cargo clean
