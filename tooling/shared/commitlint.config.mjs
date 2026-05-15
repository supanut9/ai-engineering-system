// commitlint.config.mjs
// Conventional Commits configuration.
// Requires: @commitlint/cli ^21.0.1, @commitlint/config-conventional ^21.0.1
//
// Usage: copy to project root as `commitlint.config.mjs` and install the
// required packages (see tooling/shared/README.md for the package list).

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],

  rules: {
    // Subject line must not exceed 72 characters.
    "header-max-length": [2, "always", 72],

    // Scope is optional — omit for single-package repos, use for monorepos.
    "scope-empty": [0, "never"],

    // Body and footer lines must not exceed 100 characters.
    "body-max-line-length": [2, "always", 100],
    "footer-max-line-length": [2, "always", 100],

    // Disallow uppercase subject start ("fix: Add" → "fix: add").
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],

    // Subject must not end with a period.
    "subject-full-stop": [2, "never", "."],
  },
};

export default config;
