/**
 * react-native-ultrastore v2.0.0
 * A super fast, lightweight storage + state management library
 * Powered by MMKV v4 + Nitro Modules
 */

// Main hooks
export { useUltraStore } from './hooks/useUltraStore';
export { useUltraStoreSelector } from './hooks/useUltraStoreSelector';
export { useUltraStoreValue } from './hooks/useUltraStoreValue';
export { useUltraStoreSetter } from './hooks/useUltraStoreSetter';

// Storage
export { defaultStorage, createStorage, StorageEngine } from './storage';

// Store
export { Store, getStore, clearStoreRegistry } from './store';

// Atoms (New in v2)
export { createAtom, useUltraAtom } from './atom';
export type { Atom } from './atom';

// Batching (New in v2)
export { batchSet, useBatchUpdate } from './batch';

// Zustand Adapter (New in v2)
export { createUltraZustandStorage } from './zustand';

// Utils
export { createNamespace } from './utils/createNamespace';
export { clearAll } from './utils/clearAll';
export { removeKey } from './utils/removeKey';
export { getAllKeys } from './utils/getAllKeys';

// Middlewares
export { createLoggerMiddleware } from './middlewares/logger';
export { createValidatorMiddleware } from './middlewares/validator';
export { createDevToolsMiddleware } from './middlewares/devtools'; // New in v2

// Types
export type {
  Listener,
  StoreConfig,
  UltraStoreOptions,
  Middleware,
  SetStateAction,
  Selector,
} from './types';
