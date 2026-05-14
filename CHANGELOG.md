# Changelog

All notable changes to this project will be documented in this file.

## [2.2.0] - 2025-01-01

### Added

- 🌐 `useUltraQuery` — Persistent async data fetching hook backed by MMKV. Cache survives app restarts and works offline. Supports `staleTime`, `cacheTime`, `refetchOnMount`, `enabled`, `onSuccess`, `onError`, `refetch`, and `invalidate`.
- 🔐 Log injection security fix across `storage.ts`, `MMKVAdapter.ts`, `logger.ts`, and `validator.ts`
- 🧹 `package.json` cleanup — removed malformed strings in keywords

## [2.0.0] - 2025-06-01

### Added

- ⚛️ Atom API (`createAtom`, `useUltraAtom`) — Jotai-style atomic state
- 📦 Zustand Adapter (`createUltraZustandStorage`)
- 🔄 Batch Updates (`batchSet`, `useBatchUpdate`)
- 🕐 Undo / Redo History (`useUltraHistory`)
- 🛠️ Migration Manager (`createMigrationManager`)
- 🛠️ DevTools Middleware (`createDevToolsMiddleware`) with Redux DevTools bridge
- 🧮 Derived state hook (`useDerived`)
- 🌍 Web / SSR support via `localStorage`
- 🧪 Expo Go fallback via AsyncStorage + Memory
- ⚡ Async thunk support in `setValue`

### Breaking Changes

- Requires `react-native-mmkv@>=4.0.0`
- Requires React Native `>=0.75.0` (New Architecture)

## [1.0.0] - 2025-10-01

### Added

- 🎉 Initial release of react-native-ultrastore
- ⚡ Core `useUltraStore` hook for state + persistence
- 🔍 `useUltraStoreSelector` for optimized re-renders
- 📖 `useUltraStoreValue` for read-only access
- ✍️ `useUltraStoreSetter` for write-only updates
- 🎭 Namespace support with `createNamespace`
- 🔒 Encryption support via MMKV
- 🔌 Middleware system (logger, validator)
- 🛠️ Utility functions (clearAll, removeKey, getAllKeys)
- 📦 Full TypeScript support
- 🧪 Unit tests for core functionality
- 📚 Comprehensive documentation
- 🎨 Example React Native CLI app
- 🏗️ Fabric architecture compatible
