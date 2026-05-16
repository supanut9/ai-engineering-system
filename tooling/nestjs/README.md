# NestJS Tooling Delta

This directory contains the **NestJS-specific tooling overlay** on top of `tooling/nodejs/`.
`scripts/init-project.sh` copies the Node base first and then overlays this directory for
`nestjs-*` stacks.

## Files

| File | Purpose |
|---|---|
| `eslint.config.mjs` | Self-contained NestJS-tuned ESLint flat config; replaces the Node base for nestjs-* stacks |
| `.prettierrc` | Identical to the Node base |
| `jest.config.mjs` | ts-jest preset wired for NestJS conventions |

The ESLint config is self-contained — it does not import from `eslint.config.base.mjs` as
earlier versions did. This avoids a renaming step that the init script never performed and
that caused a `Cannot find package './eslint.config.base.mjs'` failure when projects ran
`make lint`.

## Adoption (manual; the init script handles this automatically)

1. Copy `tooling/nodejs/` files to your project root (ESLint, Prettier, Husky, commitlint,
   lint-staged, package.json.tooling.json).
2. Copy `tooling/nestjs/` files, overwriting `eslint.config.mjs` and adding
   `jest.config.mjs`.
3. Add the NestJS-specific dev dependencies to your `package.json`:

```json
{
  "devDependencies": {
    "@types/jest": "latest",
    "jest": "latest",
    "ts-jest": "latest"
  }
}
```

5. Add a `jest` key to your `package.json` or leave `jest.config.mjs` at the root — Jest
   auto-discovers it.

## Decorator Support

NestJS relies on TypeScript experimental decorators. Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

The ESLint config also sets these flags in `languageOptions.parserOptions` so the parser
accepts decorator syntax without a separate tsconfig requirement.

## Coverage Thresholds

`jest.config.mjs` ships with 70% branch / 80% line defaults. Adjust the
`coverageThreshold` block to fit your project's requirements.
