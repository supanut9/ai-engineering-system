// ESLint 9+ flat config — shared Node.js base
// Used directly for vanilla Node; extended by nextjs/ and nestjs/ configs.
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore build artefacts and dependencies
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      ".next/**",
    ],
  },

  // TypeScript-aware recommended rule sets
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // Project-wide settings
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Allow unused vars prefixed with _ (common convention)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Require explicit return types on exported functions
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      // Prefer const assertions and readonly where sensible
      "@typescript-eslint/prefer-readonly": "warn",
      // Disallow floating (unhandled) promises
      "@typescript-eslint/no-floating-promises": "error",
      // Enforce consistent type imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      // Safety: no explicit any
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Plain JS files — relax type-checked rules
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
  },
);
