# Subagent Contract

## Purpose

This contract defines how the coordinating agent should delegate work to a
subagent or spawned worker.

## Delegation Rule

Only delegate work that is:
- concrete
- bounded
- non-overlapping with other active write scopes
- useful without needing broad project reinterpretation

## Required Task Packet

Each subagent task should include:

### Goal

One sentence describing the exact outcome.

### Scope

- allowed services
- allowed files or modules
- explicit write boundaries

### Inputs

- relevant project docs
- relevant stack profiles
- relevant existing files

### Constraints

- do not redesign the architecture
- do not widen scope
- do not revert unrelated work

### Acceptance Criteria

- concrete expected behavior

### Verification

- tests or checks to run

### Output Format

- changed files
- implementation summary
- verification results
- risks or follow-up

## Integration Rule

The coordinating agent remains responsible for:
- consistency across subagent outputs
- updating workflow state
- deciding whether the task is actually complete

## Parallel Lanes And Waves

### why this pattern exists

Most non-trivial phase work decomposes into multiple parallel slices with separate
write surfaces. Running them sequentially leaves the coordinator idle. Running them
all in parallel without structure causes merge collisions and contradictory contracts.
Lanes + waves solve both: parallelism within a wave, safety across waves.

### definitions

- **Lane** — one subagent task with a sole owner, a fixed write surface, and a clear
  acceptance criterion.
- **Wave** — a group of lanes that can safely run in parallel because their write
  surfaces do not overlap.
- **Coordinator** — the parent agent (or human) that issues lane briefs, holds the
  shared design, and wires integration after each wave finishes.

### rules

1. **Lanes within a wave run in parallel** — issued in a single message with multiple
   subagent tool calls.
2. **Waves run sequentially** — wave N+1 may depend on wave N's interfaces (data
   shapes, file paths, exported names). The coordinator confirms those interfaces in
   the lane brief before issuing the next wave.
3. **Write surfaces must be disjoint** — two lanes in the same wave must not share an
   owned file. The brief lists "Files you own" and "Files you MUST NOT touch"
   explicitly.
4. **Cross-lane integration belongs to the coordinator** — wiring two lanes' outputs
   into a third file is the coordinator's responsibility, not a lane's. This is what
   keeps lanes truly parallel.
5. **Each lane is self-contained** — the brief must include all context (goal, owned
   paths, must-not-touch, integration interface, acceptance criteria, style
   constraints). The lane will not see the conversation history.
6. **Acceptance criteria are runnable where possible** — `bash -n`, `go test ./...`,
   `mkdocs build --strict` rather than "looks fine".

### lane brief shape (required fields)

- Goal — one sentence
- Files you own — explicit list
- Files you MUST NOT touch — explicit list of adjacent lanes' write surfaces
- Behaviour or content spec — the substantive instructions
- Integration interface — the contracts other lanes depend on
- Acceptance criteria — concrete, ideally automated
- Style and voice constraints — consistent across the repo
- Reporting format — what to send back, max length

### how to split a phase into lanes

1. List every file the phase will create or edit.
2. Group files by topical proximity and by skill (frontend / backend / docs / scripts).
3. Confirm no two groups touch the same file. If they do, refactor: introduce an
   interface file, split one group further, or sequence the groups across waves.
4. Build the wave order so each wave only depends on artifacts already settled by the
   previous wave.
5. Cap at 3–4 parallel lanes per wave — more increases coordination overhead without
   proportional throughput gain.
6. Write the wave table into the plan file before issuing any subagent calls (see
   `workflow/ai-workflow.md §Plan Files At Project Root`).

### anti-patterns

- **Phantom parallelism** — five lanes that all need to read a sixth file the
  coordinator has not written yet. Reduces to sequential.
- **Shared write surfaces** — two lanes both touching `Makefile` or `package.json`.
  One wins; the other is silently lost.
- **Lane briefs that lean on conversation context** — the lane has no conversation
  history. Self-contained briefs only.
- **Spawning more lanes mid-wave** — wait for the current wave to finish and
  integrate, then plan the next wave.
- **Coordinator absent during integration** — after a wave, the coordinator reconciles
  drift and updates docs that span lanes. Skipping this step is how
  `docs/architecture/system-design.md` ends up describing a layout the code does not
  have.

### relationship to the task packet

The lane brief is a specialised form of the Required Task Packet above. All Required
Task Packet fields still apply. The additional lane-specific fields (integration
interface, wave membership, must-not-touch list) extend rather than replace the base
contract.
