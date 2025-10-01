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

  constructor(key: string, initialValue: T, storage?: StorageEngine) {
    this.key = key;
    this.storage = storage || defaultStorage;

    // Load persisted value or use initial value
    const persistedValue = this.storage.get<T>(key);
    this.currentValue = persistedValue !== undefined ? persistedValue : initialValue;

    // If no persisted value, save initial value
    if (persistedValue === undefined) {
      this.storage.set(key, initialValue);
    }
  }

  /**
   * Get current value
   */
  getValue(): T {
    return this.currentValue;
  }

  /**
   * Set new value
   */
  setValue(action: SetStateAction<T>): void {
    const newValue =
      typeof action === 'function'
        ? (action as (prevState: T) => T)(this.currentValue)
        : action;

    // Only update if value changed
    if (newValue !== this.currentValue) {
      this.currentValue = newValue;
      this.storage.set(this.key, newValue);
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentValue);
      } catch (error) {
        console.error('[UltraStore] Error in listener:', error);
      }
    });
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
    this.storage.delete(this.key);
    this.listeners.clear();
  }
}

// Store registry to maintain singleton stores per key
const storeRegistry = new Map<string, Store<any>>();

/**
 * Get or create a store instance
 */
export const getStore = <T>(
  key: string,
  initialValue: T,
  storage?: StorageEngine
): Store<T> => {
  if (!storeRegistry.has(key)) {
    storeRegistry.set(key, new Store(key, initialValue, storage));
  }
  return storeRegistry.get(key) as Store<T>;
};

/**
 * Clear store registry (useful for testing)
 */
export const clearStoreRegistry = (): void => {
  storeRegistry.clear();
};

export { Store };
