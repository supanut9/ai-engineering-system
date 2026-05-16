.PHONY: setup run test lint fmt typecheck build

setup:
	npm install --no-audit --no-fund

run:
	npm start

test:
	npm test -- --watchAll=false

lint:
	npm run lint

fmt:
	# format: add Prettier in Phase 3 tooling
	@echo "fmt: configure prettier in Phase 3"

typecheck:
	npm run typecheck

# Expo has no traditional JS build step; typecheck is the gate.
build: typecheck
