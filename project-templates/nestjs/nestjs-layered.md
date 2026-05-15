# NestJS Layered

## Use When

Use this blueprint when:

- the stack is NestJS
- the code architecture is layered
- the service should align with standard Nest module structure

## Stack

- runtime: Node.js
- framework: NestJS
- default database: PostgreSQL

## Code Architecture

- style: layered architecture

## Bootstrap

Initial setup:

```bash
nest new my-service --strict
```

## Folder Structure

```text
src/
  modules/
    users/
      users.controller.ts
      users.service.ts
      users.module.ts
      dto/
      entities/
  common/
    filters/
    guards/
    interceptors/
    pipes/
  config/
test/
docs/
  requirements/
  specs/
  architecture/
  plan/
  tests/
  release/
  maintenance/
.ai/
  workflow/
```

## Folder Responsibilities

- `src/modules/*` = feature modules
- `*.controller.ts` = transport edge
- `*.service.ts` = application and business logic
- `dto/` = request validation and transport contracts
- `entities/` = persistence or internal data structures as needed
- `src/common/` = shared cross-cutting framework utilities
- `src/config/` = environment and app configuration

## Required Workflow Files

- `AGENTS.md` or `CLAUDE.md` depending on tool
- `.ai/workflow/project-context.md`
- `.ai/workflow/workflow-state.md`
- `.ai/workflow/active-task.md`

## Notes

- keep controllers thin
- do not let DTOs become the domain model for everything
- use this as the default NestJS blueprint unless there is a clear reason to
  introduce stricter clean architecture boundaries
