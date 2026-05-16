// ESLint 9+ flat config for Expo / React Native projects.
//
// Expo ships its own flat-config preset that knows about React, React Native,
// the Babel runtime and Metro's resolver. It replaces the shared
// `tooling/nodejs/eslint.config.mjs` for mobile stacks because the
// type-checked TypeScript rules in that config are too strict for typical
// Expo apps and require devDeps the mobile skeleton intentionally avoids.
//
// Customize by extending the exported config; see eslint-config-expo docs.
import expoConfig from "eslint-config-expo/flat.js";

export default [
  ...expoConfig,
  {
    ignores: [
      ".expo/**",
      "android/**",
      "ios/**",
      "node_modules/**",
      "dist/**",
      "build/**",
    ],
  },
];
