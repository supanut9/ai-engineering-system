# tooling / react-native

ESLint flat-config overlay for Expo / React Native projects.

The mobile profile diverges from the shared `tooling/nodejs/` Node base because:

1. `eslint-config-expo` already encodes the React, React Native and Metro
   rules an Expo project needs.
2. The shared Node config enables `typescript-eslint` type-checked rules, which
   require `parserOptions.projectService` to resolve the whole tsconfig graph
   — strict, slow on RN, and pulls in `typescript-eslint` as a hard
   dependency. The mobile skeleton intentionally keeps its devDeps small.

`scripts/init-project.sh` copies `tooling/nodejs/` first then overlays this
directory for `react-native-*` stacks, so this file overwrites the Node-base
`eslint.config.mjs` on disk.
