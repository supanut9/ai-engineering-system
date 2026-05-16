// ESLint 9+ flat config for NestJS projects.
//
// Self-contained — does not import from the shared `tooling/nodejs/` config.
// `init-project.sh` copies `tooling/nodejs/` first then overlays this file,
// which replaces the base `eslint.config.mjs` on disk for nestjs-* stacks.
// Reproducing the shared Node base rules here avoids the renaming step the
// older config required (it imported `./eslint.config.base.mjs`, a file the
// init script never created).
//
// Differences from the shared Node base:
//   - Enables decorator metadata (required by reflect-metadata / NestJS DI).
//   - Relaxes rules that conflict with NestJS conventions (constructor
//     side-effects, parameter decorators, empty constructors).
//   - Loosens the type-checked rule set on lifecycle hooks and DTO classes.
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore build artefacts and dependencies.
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
    ],
  },

  // TypeScript-aware recommended rule sets (shared with the Node base).
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // Project-wide settings.
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        // NestJS uses decorators heavily; ensure metadata is parsed.
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
    rules: {
      // Allow unused vars prefixed with _ (common convention).
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // Disallow floating (unhandled) promises.
      "@typescript-eslint/no-floating-promises": "error",
      // Enforce consistent type imports.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],

      // NestJS-specific relaxations.
      // Modules, controllers and providers use class-based side-effects in
      // constructors (super(), module registration). Allow them.
      "@typescript-eslint/no-useless-constructor": "off",
      // Decorators such as @Body(), @Param() produce implicit any in
      // parameter position — relax to warn rather than error.
      "@typescript-eslint/no-explicit-any": "warn",
      // Lifecycle hooks (onModuleInit, onApplicationBootstrap, etc.) are
      // void and async — explicit return types would add noise.
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },

  // Plain JS files — relax type-checked rules.
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
  },
);
