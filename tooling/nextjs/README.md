# Next.js Tooling Delta

This directory contains only the **Next.js-specific additions** on top of `tooling/nodejs/`.
Copy both the `nodejs/` base and these files into your project.

## Files

| File | Purpose |
|---|---|
| `eslint.config.mjs` | Extends the Node base; adds @next/next, react, and react-hooks rules |
| `.prettierrc` | Identical to the Node base (no Tailwind plugin — opt-in separately) |
| `next.config.mjs.template` | Minimal Next 16 config; rename to `next.config.mjs` in your project |

## Adoption

1. Copy `tooling/nodejs/` files to your project root (ESLint, Prettier, Husky, commitlint,
   lint-staged, package.json.tooling.json).
2. Copy `tooling/nextjs/` files, overwriting the `eslint.config.mjs` from step 1.
3. Rename `next.config.mjs.template` to `next.config.mjs`.
4. Add the Next.js-specific dev dependencies to your `package.json`:

```json
{
  "devDependencies": {
    "@next/eslint-plugin-next": "16.2.6",
    "eslint-plugin-react": "7.37.5",
    "eslint-plugin-react-hooks": "7.1.1"
  }
}
```

5. The `eslint.config.mjs` imports the Node base as `./eslint.config.base.mjs`. Rename your
   copied Node `eslint.config.mjs` to `eslint.config.base.mjs` in the project root, then
   use the Next.js `eslint.config.mjs` as the entry point.

## Tailwind CSS

`prettier-plugin-tailwindcss` is **not** included by default. If your project uses Tailwind,
add the plugin manually:

```bash
npm install -D prettier-plugin-tailwindcss
```

Then add `"plugins": ["prettier-plugin-tailwindcss"]` to `.prettierrc`.

## Pinned Versions (2026-05-15)

| Package | Version |
|---|---|
| @next/eslint-plugin-next | 16.2.6 |
| eslint-plugin-react | 7.37.5 |
| eslint-plugin-react-hooks | 7.1.1 |
