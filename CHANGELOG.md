# Changelog

All notable changes to this project will be documented in this file.

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

### Features
- 10-30x faster than AsyncStorage (powered by MMKV)
- Zero-config setup
- Auto persistence and reload
- Cross-platform (iOS + Android)
- Expo support with development builds
