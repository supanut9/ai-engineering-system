# Node.js Shared Tooling

Shared ESLint, Prettier, Husky, lint-staged, and commitlint configs for all Node-based
stacks. The `nextjs/` and `nestjs/` directories extend these configs; they do not duplicate them.

## Files

| File | Purpose |
|---|---|
| `eslint.config.mjs` | ESLint 9+ flat config with typescript-eslint (type-checked rules) |
| `.prettierrc` | Prettier options (100-char width, double quotes, trailing commas) |
| `.prettierignore` | Excludes dist, build, coverage, .next from formatting |
| `.nvmrc.template` | Pin Node 22 LTS; copy to project root as `.nvmrc` |
| `package.json.tooling.json` | Dev-dep + scripts snippet — merge into your `package.json` |
| `commitlint.config.mjs` | Conventional Commits, scope optional, subject max 72 chars |
| `lint-staged.config.mjs` | prettier + eslint --fix on JS/TS; prettier-only on JSON/MD/YAML |
| `.husky/pre-commit` | Runs lint-staged before every commit |
| `.husky/commit-msg` | Runs commitlint on every commit message |

## Adoption

1. Copy the files you need into your project root.
2. Merge `package.json.tooling.json` into your `package.json`.
3. Run `npm install`.
4. Run `npm run prepare` once to register the Husky hooks.
5. Add a `tsconfig.json` (or extend a base); the ESLint config uses `projectService: true`
   so it discovers tsconfigs automatically.

## Pinned Versions (2026-05-15)

| Package | Version |
|---|---|
| eslint | 10.4.0 |
| typescript-eslint | 8.59.3 |
| prettier | 3.8.3 |
| husky | 9.1.7 |
| lint-staged | 17.0.4 |
| @commitlint/cli | 21.0.1 |
| @commitlint/config-conventional | 21.0.1 |
| typescript | 6.0.3 |
| @types/node | 25.8.0 |

## Notes

- ESLint config uses `projectService: true` (TypeScript ESLint v8+) instead of the legacy
  `project: ['./tsconfig.json']` form. This works without explicit tsconfig paths for most
  single-package projects.
- Plain `.js` / `.mjs` files automatically skip type-checked rules via the
  `disableTypeChecked` spread at the bottom of `eslint.config.mjs`.
