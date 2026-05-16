.PHONY: setup run test lint lint-fix fmt build clean

setup:
	cargo fetch

run:
	cargo run --bin api

test:
	cargo test --all-features

lint:
	cargo fmt --all -- --check
	cargo clippy --all-targets --all-features -- -D warnings

lint-fix:
	cargo fmt --all
	cargo clippy --all-targets --all-features --fix --allow-dirty --allow-staged

fmt: lint-fix

build:
	cargo build --release --bin api

clean:
	cargo clean
