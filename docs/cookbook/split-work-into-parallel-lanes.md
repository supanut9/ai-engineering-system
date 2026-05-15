# split work into parallel lanes

## goal

By the end of this recipe you will be able to decompose a substantial feature into non-overlapping lanes, write correct lane briefs, and issue a wave of parallel Claude Code subagent calls — then integrate the results as a coordinator.

## prerequisites

- Read `workflow/subagent-contract.md §Parallel Lanes And Waves` in full. This recipe is a hands-on application; the theory lives there.
- A feature plan file at the repo root (see [`write-a-plan-file.md`](write-a-plan-file.md)). The wave table belongs in the plan before any subagent is launched.
- Claude Code with subagent tool access enabled.

## steps

**1. List every file the feature will create or edit.**

Write the full list out. Do not group yet. Example for a "user authentication" feature:

```
docs/architecture/decisions/0003-use-jwt.md
docs/specs/api-spec.md  (update)
internal/core/user/user.go
internal/core/user/user_test.go
internal/core/user/repository.go
internal/ports/inbound/auth.go
internal/adapters/inbound/http/handlers/auth_handler.go
internal/adapters/inbound/http/handlers/auth_handler_test.go
internal/adapters/outbound/memory/user_repository.go
internal/adapters/outbound/memory/user_repository_test.go
cmd/api/main.go  (update — wire auth routes)
```

**2. Group files by topical proximity and skill.**

Common groupings: domain/core logic, HTTP handlers, adapters, documentation, configuration. Each group will become one lane.

From the example:

| Candidate lane | Files |
|----------------|-------|
| Docs | `docs/architecture/decisions/0003-use-jwt.md`, `docs/specs/api-spec.md` |
| Domain | `internal/core/user/*`, `internal/ports/inbound/auth.go` |
| HTTP adapter | `internal/adapters/inbound/http/handlers/auth_handler.go`, `auth_handler_test.go` |
| Storage adapter | `internal/adapters/outbound/memory/user_repository.go`, `user_repository_test.go` |
| Wiring | `cmd/api/main.go` |

**3. Verify write surfaces are disjoint within each wave.**

No two lanes in the same wave may touch the same file. In the example, `cmd/api/main.go` depends on the HTTP handler and domain types being defined first — it cannot run in parallel with them. Move it to a later wave.

**4. Order waves so each wave only uses interfaces settled by the previous wave.**

```
Wave 1 (parallel): Docs lane + Domain lane
  → Wave 1 settles: ADR, port interface signatures, core types
Wave 2 (parallel): HTTP adapter lane + Storage adapter lane
  → Wave 2 depends on: port interfaces from Wave 1
Wave 3 (sequential): Wiring lane
  → Wave 3 depends on: handler and repository types from Wave 2
```

Cap each wave at 3–4 lanes. More lanes increase coordination overhead without proportional throughput gain.

**5. Write the wave table into the plan file.**

Add a `## parallel sub-agent execution plan` section to `<feature>-plan.md` before issuing any subagent calls. Use a table per wave listing Lane, Owns, and Must not touch. For the authentication example: Wave 1 runs L1 Docs and L2 Domain in parallel; Wave 2 runs L3 HTTP handler and L4 Storage adapter in parallel; Wave 3 runs L5 Wiring alone because it depends on types produced by both Wave 2 lanes. The wave table must be written and reviewed before any subagent call is issued.

**6. Write a lane brief for each lane.**

Each brief must include all required fields (see `workflow/subagent-contract.md §lane brief shape`). The lane has no conversation history — self-contained briefs only.

Minimal brief structure for Lane L2:

```
Goal: Implement the user domain entity, service interface, and inbound auth port.
Files you own: internal/core/user/user.go, internal/core/user/user_test.go,
  internal/core/user/repository.go, internal/ports/inbound/auth.go
Files you MUST NOT touch: cmd/, internal/adapters/, docs/
Integration interface: Export types User, AuthInput, AuthOutput and interface
  AuthService — these are the contracts Lanes L3 and L4 depend on.
Acceptance criteria: go test ./internal/core/... exits 0.
Style: Go 1.21 idioms, no global state, error wrapping with fmt.Errorf.
Reporting: list files created/modified, paste test output, note any open risks.
```

**7. Issue Wave 1 lanes in a single message.**

In Claude Code, use the subagent tool to call all Wave 1 lanes simultaneously. Do not send them one at a time — concurrent calls in one message is what makes the lanes genuinely parallel:

```
[subagent: L1 Docs brief here]
[subagent: L2 Domain brief here]
```

**8. Wait for Wave 1 to complete, then integrate.**

As coordinator, reconcile the outputs before Wave 2:

- Verify the integration interface (exported types and interfaces) matches what the Wave 2 briefs expect.
- Update any shared files (e.g., the plan file itself) if Wave 1 produced something different than planned.
- Do not issue Wave 2 until integration is complete.

**9. Issue Wave 2, then Wave 3, following the same process.**

**10. Run the full test suite after the final wave.**

```bash
make test   # or pytest, depending on stack
```

All tests across all lanes must pass together. Individual lane tests passed in isolation; integration may surface interface mismatches.

## verification

```bash
# After all waves:
make test                  # exit 0
git diff --stat HEAD~N     # confirm the changeset matches the planned file list
grep -r '{{' docs/ || true  # no unfilled placeholders in doc lanes
```

Check the wave table in the plan file: every lane should have a "done" marker or integration note before the final commit.

## common issues

**Two lanes accidentally share a file** — discovered during integration when one lane's output overwrites another's. Prevention: audit the "owns" lists before issuing the wave. Cure: re-run the lane that was overwritten, or merge manually and run tests.

**Lane brief references conversation context** — a lane sees only its brief, not the chat history. If the brief says "as we discussed earlier", it will fail silently. Every piece of context must be explicit in the brief.

**Integration interface drifted between Wave 1 and Wave 2 briefs** — if Wave 1 produces a different type name than the Wave 2 brief expects, Wave 2 code will not compile. Always diff Wave 1 output against Wave 2 briefs before issuing Wave 2.

**Spawning more lanes mid-wave** — resist the urge to add a lane after a wave has started. New lanes that depend on in-progress lanes create phantom parallelism. Finish the current wave, integrate, then plan the next wave.

## see also

- `workflow/subagent-contract.md §Parallel Lanes And Waves` — the canonical definition of this pattern.
- [`write-a-plan-file.md`](write-a-plan-file.md) — the wave table belongs in the plan file before any lanes are issued.
- `workflow/ai-workflow.md §Plan Files At Project Root §Parallel sub-agent execution plan` — how the plan file section relates to lane execution.
- The system roadmap at `ai-engineering-system-plan.md §5` shows how Phase 5 of this very system was decomposed into waves and lanes, serving as a real worked example.
