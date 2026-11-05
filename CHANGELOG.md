# Changelog

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
