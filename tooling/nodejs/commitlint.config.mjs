// commitlint flat config — extends Conventional Commits preset
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Scope is optional (not required, not disallowed)
    "scope-empty": [0, "never"],
    // Subject must not exceed 72 characters
    "subject-max-length": [2, "always", 72],
  },
};
