# Changelog

## [3.1.0] - 2026-11-16

### Fixed

- `useUltraQuery` now rejects structurally invalid cache entries and prevents stale in-flight requests from updating a remounted hook instance.
- Migration version parsing now safely recovers from malformed stored versions and rejects invalid target versions.
- Vector search no longer re-validates already-owned cache buffers for every candidate.
- `UltraStreamCache` memoizes each joined snapshot and returns a copy of its token list, preventing consumer mutation from corrupting the active buffer.

### Documentation and packaging

- Added LLM-oriented API references and project rules, including explicit constraints around Base64 vector persistence and JavaScript-level batch visibility.
- Added `typesVersions`, explicit package files, and side-effect metadata for TypeScript and tree-shaking consumers.
- Replaced unverified benchmark and migration claims with reproducible guidance.

## [3.0.0] - 2026-11-05

### Changed

- Added per-engine store registry identities so equal keys from separate storage engines never share state or listeners.
- Namespaced web and AsyncStorage fallback persistence by storage ID; fallback memory is now owned by each engine.
- Added `StorageEngine.setMany()` and routed `batchSet()` through it. Batches prepare all values before a single batch notification and use React Native `unstable_batchedUpdates` for one hook render cycle.
- `clear()` now invalidates every active key listener and guards against stale fallback hydration restoring cleared values.
- `Store.delete()` now notifies connected stores before detaching, releases listeners, and removes its precise registry entry.
- `clearStoreRegistry()` now disposes registered stores instead of merely dropping map references.
- Removed the unexported legacy MMKV adapter in favor of the maintained `StorageEngine` implementation.

### Documentation

- Rewrote the README and API reference around implemented behavior; removed unverified performance, package-size, and zero-copy claims.

## [2.2.0]

### Added

- Persistent `useUltraQuery` API cache, logger sanitization, and validation helpers.

## [2.0.0]

### Added

- Atoms, Zustand adapter, batching API, history, migrations, DevTools middleware, derived state, web support, and an AsyncStorage fallback.

## [1.0.0]

### Added

- Core storage engine, persisted state hooks, namespaces, middleware, TypeScript support, and example app.
