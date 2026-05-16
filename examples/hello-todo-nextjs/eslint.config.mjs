// ESLint 9+ flat config for Next.js projects.
//
// Uses the flat-config entries shipped by `eslint-config-next` v16+.
// Self-contained — does not import from the shared `tooling/nodejs/` config,
// since `eslint-config-next` already wraps the React, JSX-a11y, and
// TypeScript rule sets a Next.js app needs.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [
      ".next/**",
      "out/**",
      "next-env.d.ts",
      "node_modules/**",
      "coverage/**",
    ],
  },
];

export default config;
