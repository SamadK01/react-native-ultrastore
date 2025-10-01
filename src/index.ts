/**
 * react-native-ultrastore
 * A super fast, lightweight storage + state management library
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

// Utils
export { createNamespace } from './utils/createNamespace';
export { clearAll } from './utils/clearAll';
export { removeKey } from './utils/removeKey';
export { getAllKeys } from './utils/getAllKeys';

// Middlewares
export { createLoggerMiddleware } from './middlewares/logger';
export { createValidatorMiddleware } from './middlewares/validator';

// Types
export type {
  Listener,
  StoreConfig,
  UltraStoreOptions,
  Middleware,
  SetStateAction,
  Selector,
} from './types';
