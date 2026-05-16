# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Releases are managed automatically by [release-please](https://github.com/googleapis/release-please-action). Commits on `main` that follow Conventional Commits drive the next version bump and the entries below; see the contributing guide for the format.

## [0.6.0](https://github.com/supanut9/ai-engineering-system/compare/ai-engineering-system-v0.5.0...ai-engineering-system-v0.6.0) (2026-05-16)


### Features

* **ci:** add npm publish workflow for create-ai-engineering-system ([#26](https://github.com/supanut9/ai-engineering-system/issues/26)) ([326900b](https://github.com/supanut9/ai-engineering-system/commit/326900be922b129160a84a2d6ab25997d877d184))
* **ci:** smoke-test the create-ai-engineering-system wrapper ([#27](https://github.com/supanut9/ai-engineering-system/issues/27)) ([9032d35](https://github.com/supanut9/ai-engineering-system/commit/9032d35b84c781b9b3a485494782c42b053011fd))
* **doctor:** add skill-mirror + workflow-state consistency checks ([#25](https://github.com/supanut9/ai-engineering-system/issues/25)) ([5b8c1d8](https://github.com/supanut9/ai-engineering-system/commit/5b8c1d8c15e2ac38618aad1e55730effdae88868))
* **examples:** add hello-todo-rust as the Rust+Axum reference project ([#28](https://github.com/supanut9/ai-engineering-system/issues/28)) ([2d6b85a](https://github.com/supanut9/ai-engineering-system/commit/2d6b85a45457b14010300deca8da743857f8ec02))
* **npm:** add create-ai-engineering-system wrapper ([#22](https://github.com/supanut9/ai-engineering-system/issues/22)) ([88e5488](https://github.com/supanut9/ai-engineering-system/commit/88e54886b305e88197ba089525c0534b0ec622dd))
* **skills:** add workflow-runner meta-skill ([#20](https://github.com/supanut9/ai-engineering-system/issues/20)) ([1f11384](https://github.com/supanut9/ai-engineering-system/commit/1f11384d28b4f6d192aa6064ce729353312ccec3))
* **stack:** add rust-axum-hexagonal stack ([#24](https://github.com/supanut9/ai-engineering-system/issues/24)) ([dac37d3](https://github.com/supanut9/ai-engineering-system/commit/dac37d3d5167d1c8ffb1dc9ec97e1cd69ec2b216))
* **templates:** add multi-service api-and-web blueprint ([#23](https://github.com/supanut9/ai-engineering-system/issues/23)) ([13c0f8a](https://github.com/supanut9/ai-engineering-system/commit/13c0f8af09f8dcdecc9c03a23781d839747f4ba0))

## [0.5.0](https://github.com/supanut9/ai-engineering-system/compare/ai-engineering-system-v0.4.0...ai-engineering-system-v0.5.0) (2026-05-16)


### Features

* **examples:** add hello-todo-react-native-expo as the mobile reference ([ab6e6a2](https://github.com/supanut9/ai-engineering-system/commit/ab6e6a2c13ae005344c3c5c1913f920be7fa03cf))


### Bug Fixes

* **examples/rn-expo:** rewrap project-brief to avoid MD004 false-positive ([afbfb9f](https://github.com/supanut9/ai-engineering-system/commit/afbfb9fbbf4fa7de425eefd827b41ada0dd17f06))

## [0.4.0](https://github.com/supanut9/ai-engineering-system/compare/ai-engineering-system-v0.3.0...ai-engineering-system-v0.4.0) (2026-05-16)


### Features

* **examples:** add hello-todo-fastify as the Fastify hexagonal reference ([2fd5b91](https://github.com/supanut9/ai-engineering-system/commit/2fd5b91c1c4f2be4c8f732844cdab6053ba5e654))


### Bug Fixes

* **tooling/nestjs:** inline the Node base config + advertise fastify in verify-example ([a5fc5b6](https://github.com/supanut9/ai-engineering-system/commit/a5fc5b6bdb89163e0fd9c29b05843d80fa2821b1))

## [0.3.0](https://github.com/supanut9/ai-engineering-system/compare/ai-engineering-system-v0.2.0...ai-engineering-system-v0.3.0) (2026-05-16)


### Features

* **examples:** add hello-todo-nextjs as the Next.js reference project ([3dbe2a1](https://github.com/supanut9/ai-engineering-system/commit/3dbe2a14879824a788f725b2360e5135410c73f8))
* **skeletons:** bump nestjs-layered to TypeScript 6 + Jest 30 ([3da92ef](https://github.com/supanut9/ai-engineering-system/commit/3da92ef8d2b367532e7203732c9f3010b744711d))
* **verify-example:** add Next.js stack + advertise hello-todo-nextjs ([0613a0e](https://github.com/supanut9/ai-engineering-system/commit/0613a0e9257b329fb62cd20da00e20e260201f56))

## [0.2.0](https://github.com/supanut9/ai-engineering-system/compare/ai-engineering-system-v0.1.0...ai-engineering-system-v0.2.0) (2026-05-16)


### Features

* **tooling:** add react-native eslint overlay using eslint-config-expo ([a672473](https://github.com/supanut9/ai-engineering-system/commit/a6724730023836342f7d6895faa0d0e95d7354f6))


### Bug Fixes

* **ci:** bump CI Go to 1.25.x ([b0a863e](https://github.com/supanut9/ai-engineering-system/commit/b0a863ed357332b59bb0ee8d8d466da33dc09113))
* **ci:** make markdown + actionlint lints green ([6e71e2f](https://github.com/supanut9/ai-engineering-system/commit/6e71e2fa686cb97df1892ec79b87e839a1e4230b))
* **ci:** relax markdownlint rules that fight existing prose style ([1f37489](https://github.com/supanut9/ai-engineering-system/commit/1f374894dce57766ec0bf1ce67d671a1b97e68c7))
* **ci:** use reviewdog/action-actionlint wrapper; tune markdownlint rules ([f217b37](https://github.com/supanut9/ai-engineering-system/commit/f217b373c0c0f562b927be6cdeb40019cf734721))
* **skeletons:** make node-based stack templates pass selftest ([1f4d5b7](https://github.com/supanut9/ai-engineering-system/commit/1f4d5b7ae7720156b1b9c04a180bf8afd317e858))

## [0.1.0](https://github.com/supanut9/ai-engineering-system/compare/ai-engineering-system-v0.0.1...ai-engineering-system-v0.1.0) (2026-05-15)

### Features

* **skills:** add dependency-review skill ([312ecbd](https://github.com/supanut9/ai-engineering-system/commit/312ecbd5fbe8aaf40a470894d89117d3e77fbbe5))

## [Unreleased]

### Added

* _(placeholder — release-please will populate this on the next release PR)_
