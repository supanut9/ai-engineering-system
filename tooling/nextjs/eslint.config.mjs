// ESLint 9+ flat config — Next.js delta
// Extends the shared nodejs config and layers on Next.js, React, and React-Hooks rules.
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// Import the shared Node base (path assumes both configs are copied to the same project root
// side-by-side as eslint.config.mjs; adjust the import path if your layout differs).
import nodeBase from "./eslint.config.base.mjs";

export default tseslint.config(
  // Shared Node base (typescript-eslint recommended + type-checked)
  ...nodeBase,

  // Next.js recommended rules
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // React recommended rules
  {
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: {
        // "detect" reads the version from the installed package at lint time
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      // Not needed in Next.js / React 17+ with the new JSX transform
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },

  // React Hooks rules
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },

  // Next.js-specific ignores
  {
    ignores: [".next/**", "out/**", "next-env.d.ts"],
  },
);
