// ESLint 9+ flat config — NestJS delta
// Extends the shared nodejs config with NestJS-specific TypeScript settings:
//   - Enables decorator metadata (required by reflect-metadata / NestJS DI)
//   - Relaxes rules that conflict with NestJS conventions (constructor side-effects,
//     parameter decorators, empty constructors)
import tseslint from "typescript-eslint";

// Import the shared Node base (rename your copied nodejs/eslint.config.mjs to
// eslint.config.base.mjs at the project root; see README for details).
import nodeBase from "./eslint.config.base.mjs";

export default tseslint.config(
  // Shared Node base (typescript-eslint recommended + type-checked)
  ...nodeBase,

  // NestJS-specific overrides
  {
    languageOptions: {
      parserOptions: {
        // Ensure experimental decorators are parsed (NestJS uses them heavily)
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
    rules: {
      // Controllers and Services commonly have injected constructor args that are
      // not used inside the constructor body itself — suppress the unused-vars warning.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          // Constructor parameters injected via DI are bound to class properties
          // via parameter decorators — TypeScript handles them, not ESLint.
          ignoreRestSiblings: true,
        },
      ],
      // NestJS modules, controllers and providers use class-based side-effects
      // in constructors (super(), module registration). Allow them.
      "@typescript-eslint/no-useless-constructor": "off",
      // Decorators such as @Body(), @Param() produce implicit any in parameter
      // position — relax to warn rather than error.
      "@typescript-eslint/no-explicit-any": "warn",
      // Lifecycle hooks (onModuleInit, onApplicationBootstrap, etc.) are void
      // and async — explicit return types would add noise.
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },

  // Ignore compiled output
  {
    ignores: ["dist/**", "coverage/**"],
  },
);
