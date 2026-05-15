# NestJS Tooling Delta

This directory contains only the **NestJS-specific additions** on top of `tooling/nodejs/`.
Copy both the `nodejs/` base and these files into your project.

## Files

| File | Purpose |
|---|---|
| `eslint.config.mjs` | Extends the Node base; relaxes rules for decorators and DI patterns |
| `.prettierrc` | Identical to the Node base |
| `jest.config.mjs` | ts-jest preset wired for NestJS conventions |

## Adoption

1. Copy `tooling/nodejs/` files to your project root (ESLint, Prettier, Husky, commitlint,
   lint-staged, package.json.tooling.json).
2. Copy `tooling/nestjs/` files, overwriting `eslint.config.mjs` from step 1.
3. Rename the copied Node `eslint.config.mjs` to `eslint.config.base.mjs` in the project
   root; the NestJS config imports it from that path.
4. Add the NestJS-specific dev dependencies to your `package.json`:

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
