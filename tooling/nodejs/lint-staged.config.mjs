// lint-staged config — runs on staged files only
export default {
  // JS/TS: format then lint-fix
  "**/*.{js,mjs,cjs,jsx,ts,tsx}": [
    "prettier --write",
    "eslint --fix",
  ],
  // Data/doc files: format only
  "**/*.{json,md,yaml,yml}": ["prettier --write"],
};
