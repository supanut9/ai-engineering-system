.PHONY: setup run test test-e2e lint fmt build

setup:
	npm install

run:
	npm run start:dev

test:
	npm test

test-e2e:
	npm run test:e2e

# Phase 3 tooling (eslint) is not yet wired; use tsc --noEmit as the lint gate.
lint:
	npx tsc --noEmit

# NestJS projects use Prettier for formatting; add it in Phase 3 tooling.
fmt:
	@echo "fmt: add prettier in Phase 3 tooling"

build:
	npm run build
