/**
 * UltraStore State Management
 * Reactive state with automatic persistence
 */

import type { Listener, SetStateAction } from './types';
import { defaultStorage, StorageEngine } from './storage';

class Store<T = any> {
  private key: string;
  private listeners: Set<Listener<T>> = new Set();
  private storage: StorageEngine;
  private currentValue: T;
  private unsubscribeStorage: () => void;
  private unsubscribeBatchStorage: () => void;
  private isDisposed = false;

  constructor(key: string, initialValue: T, storage?: StorageEngine) {
    this.key = key;
    this.storage = storage || defaultStorage;

    // Load persisted value or use initial value
    const persistedValue = this.storage.get<T>(key);
    this.currentValue =
      persistedValue !== undefined ? persistedValue : initialValue;

    // If no persisted value, save initial value
    if (persistedValue === undefined) {
      this.storage.set(key, initialValue);
    }

    // Single consolidated event pipeline via StorageEngine onChange
    const notify = (val: T | undefined) => {
      const nextValue = val !== undefined ? val : initialValue;
      if (this.currentValue !== nextValue) {
        this.currentValue = nextValue;
      }
      this.listeners.forEach((listener) => {
        try {
          listener(this.currentValue);
        } catch (error) {
          console.error('[UltraStore] Error in listener:', error);
        }
      });
    };

    this.unsubscribeStorage = this.storage.onChange<T>(key, (val) => {
      if (!this.storage.isBatchNotificationInProgress()) {
        notify(val);
      }
    });
    this.unsubscribeBatchStorage = this.storage.onBatchChange((updates) => {
      if (updates.has(this.key)) {
        notify(updates.get(this.key) as T | undefined);
      }
    });
  }

  /**
   * Get current value
   */
  getValue(): T {
    return this.currentValue;
  }

  /**
   * Set new value (supports async actions/promises/thunks)
   */
  setValue(action: SetStateAction<T>): void | Promise<void> {
    if (action instanceof Promise) {
      return action.then((val) => this.applyValue(val));
    }

    if (typeof action === 'function') {
      // Check if it's a thunk: (set, get) => ...
      // Functions with 2 arguments are treated as thunks
      if (action.length === 2) {
        return (action as any)(
          (val: any) => this.setValue(val),
          () => this.getValue()
        );
      }

      // Regular updater: (prev) => next
      const result = (action as any)(this.currentValue);
      if (result instanceof Promise) {
        return result.then((val) => this.applyValue(val));
      }
      return this.applyValue(result);
    }

    return this.applyValue(action as T);
  }

  private applyValue(newValue: T) {
    if (newValue !== this.currentValue) {
      this.currentValue = newValue;
      this.storage.set(this.key, newValue);
    }
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener: Listener<T>): () => void {
    if (this.isDisposed) {
      return () => undefined;
    }

    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Reset to initial value
   */
  reset(initialValue: T): void {
    this.setValue(initialValue);
  }

  /**
   * Delete from storage
   */
  delete(): void {
    if (this.isDisposed) {
      return;
    }

    // Emit the deletion while still connected so mounted hooks reset before
    // this instance is detached from storage.
    this.storage.delete(this.key);
    this.dispose();
  }

  /**
   * Detach this store from its storage engine and registry without mutating
   * persisted data. Used for explicit registry cleanup.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;
    this.unsubscribeStorage();
    this.unsubscribeBatchStorage();
    this.listeners.clear();
    removeStoreFromRegistry(this.key, this.storage, this);
  }
}

// Store registry to maintain singleton stores per storage-engine instance and key.
// A storage id is not sufficient: two independently-created engines may use the
// same id while intentionally keeping their subscriptions and in-memory state apart.
const storeRegistry = new Map<string, Store<any>>();

const getRegistryKey = (key: string, storage: StorageEngine): string =>
  `${storage.getInstanceId()}:${key}`;

const removeStoreFromRegistry = (
  key: string,
  storage: StorageEngine,
  store: Store<any>
): void => {
  const registryKey = getRegistryKey(key, storage);
  if (storeRegistry.get(registryKey) === store) {
    storeRegistry.delete(registryKey);
  }
};

/**
 * Get or create a store instance
 */
export const getStore = <T>(
  key: string,
  initialValue: T,
  storage?: StorageEngine
): Store<T> => {
  const resolvedStorage = storage || defaultStorage;
  const registryKey = getRegistryKey(key, resolvedStorage);

  if (!storeRegistry.has(registryKey)) {
    storeRegistry.set(
      registryKey,
      new Store(key, initialValue, resolvedStorage)
    );
  }
  return storeRegistry.get(registryKey) as Store<T>;
};

/**
 * Clear store registry (useful for testing)
 */
export const clearStoreRegistry = (): void => {
  Array.from(storeRegistry.values()).forEach((store) => store.dispose());
};

export { Store };
