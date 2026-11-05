/**
 * UltraStore Storage Engine
 * Powered by react-native-mmkv v4 + Nitro Modules
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';
import { Platform, unstable_batchedUpdates } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UltraStoreOptions, Middleware, Listener } from './types';

let nextStorageInstanceId = 0;

type BatchListener = (updates: ReadonlyMap<string, any>) => void;

class StorageEngine {
  private storage: any;
  private readonly instanceId: number;
  private readonly storageId: string;
  private readonly fallbackKeyPrefix: string;
  private readonly memoryStorage = new Map<string, string>();
  private isFallback: boolean = false;
  private isHydrated: boolean = false;
  private hydrationGeneration = 0;
  private middlewares: Middleware[] = [];
  private listeners = new Map<string, Set<Listener<any>>>();
  private batchListeners = new Set<BatchListener>();
  private isEmittingBatch = false;
  private debug: boolean = false;

  constructor(options?: UltraStoreOptions) {
    this.instanceId = nextStorageInstanceId++;
    this.storageId = options?.id || 'ultrastore-default';
    this.fallbackKeyPrefix = `@ultrastore:${encodeURIComponent(this.storageId)}:`;
    this.initializeStorage(options);

    if (__DEV__) {
      this.log(
        'init',
        `id=${options?.id} fallback=${this.isFallback} platform=${Platform.OS}`
      );
    }
  }

  private initializeStorage(options?: UltraStoreOptions) {
    // 1. Web / SSR Support
    if (Platform.OS === 'web') {
      const isBrowser =
        typeof window !== 'undefined' &&
        typeof window.localStorage !== 'undefined';
      this.isFallback = !isBrowser; // If not browser, we use memory only (SSR)
      const toStorageKey = (key: string) => `${this.fallbackKeyPrefix}${key}`;
      const fromStorageKey = (key: string) =>
        key.slice(this.fallbackKeyPrefix.length);

      this.storage = {
        getString: (key: string) =>
          isBrowser
            ? localStorage.getItem(toStorageKey(key))
            : this.memoryStorage.get(key),
        set: (key: string, value: string) => {
          if (isBrowser) {
            localStorage.setItem(toStorageKey(key), value);
          } else {
            this.memoryStorage.set(key, value);
          }
        },
        setMany: (entries: ReadonlyArray<readonly [string, string]>) => {
          entries.forEach(([key, value]) => {
            if (isBrowser) {
              localStorage.setItem(toStorageKey(key), value);
            } else {
              this.memoryStorage.set(key, value);
            }
          });
        },
        remove: (key: string) => {
          if (isBrowser) {
            localStorage.removeItem(toStorageKey(key));
          } else {
            this.memoryStorage.delete(key);
          }
        },
        contains: (key: string) =>
          isBrowser
            ? localStorage.getItem(toStorageKey(key)) !== null
            : this.memoryStorage.has(key),
        clearAll: () => {
          if (isBrowser) {
            Object.keys(localStorage)
              .filter((key) => key.startsWith(this.fallbackKeyPrefix))
              .forEach((key) => localStorage.removeItem(key));
          } else {
            this.memoryStorage.clear();
          }
        },
        getAllKeys: () =>
          isBrowser
            ? Object.keys(localStorage)
                .filter((key) => key.startsWith(this.fallbackKeyPrefix))
                .map(fromStorageKey)
            : Array.from(this.memoryStorage.keys()),
      };
      return;
    }

    // 2. Native (iOS/Android) with MMKV
    try {
      // Check if we are in Expo Go or if native module is missing
      // createMMKV might not throw immediately, so we test it
      this.storage = createMMKV({
        id: this.storageId,
        encryptionKey: options?.encryptionKey,
      });

      // Verification check: getAllKeys() will throw if the native module is not linked (e.g. Expo Go)
      this.storage.getAllKeys();
    } catch (error) {
      this.isFallback = true;
      if (__DEV__) {
        console.warn(
          '[UltraStore] MMKV native module not found. Falling back to AsyncStorage + Memory. ' +
            'AsyncStorage is asynchronous, so initial values might be missing until storage.hydrate() is called.'
        );
      }
      this.storage = {
        getString: (key: string) => this.memoryStorage.get(key),
        set: (key: string, value: string) => {
          this.memoryStorage.set(key, value);
          AsyncStorage.setItem(`${this.fallbackKeyPrefix}${key}`, value).catch(
            (err) => console.error('[UltraStore] AsyncStorage set error:', err)
          );
        },
        setMany: (entries: ReadonlyArray<readonly [string, string]>) => {
          entries.forEach(([key, value]) => this.memoryStorage.set(key, value));
          AsyncStorage.multiSet(
            entries.map(([key, value]) => [
              `${this.fallbackKeyPrefix}${key}`,
              value,
            ])
          ).catch((err) =>
            console.error('[UltraStore] AsyncStorage batch set error:', err)
          );
        },
        remove: (key: string) => {
          this.memoryStorage.delete(key);
          AsyncStorage.removeItem(`${this.fallbackKeyPrefix}${key}`).catch(
            (err) =>
              console.error('[UltraStore] AsyncStorage remove error:', err)
          );
        },
        contains: (key: string) => this.memoryStorage.has(key),
        clearAll: () => {
          this.memoryStorage.clear();
          AsyncStorage.getAllKeys()
            .then((keys) =>
              keys.filter((key) => key.startsWith(this.fallbackKeyPrefix))
            )
            .then((keys) =>
              keys.length > 0 ? AsyncStorage.multiRemove(keys) : undefined
            )
            .catch((err) =>
              console.error('[UltraStore] AsyncStorage clear error:', err)
            );
        },
        getAllKeys: () => Array.from(this.memoryStorage.keys()),
      };
    }
  }

  /**
   * Hydrate memory store from AsyncStorage (Used only when MMKV fails)
   * This is important for Expo Go users to restore state on app start.
   */
  async hydrate(): Promise<void> {
    if (!this.isFallback || this.isHydrated) {
      return;
    }
    const hydrationGeneration = this.hydrationGeneration;

    // Only hydration makes sense for native fallback (AsyncStorage)
    if (Platform.OS === 'web') {
      this.isHydrated = true;
      return;
    }

    try {
      const keys = (await AsyncStorage.getAllKeys()).filter((key) =>
        key.startsWith(this.fallbackKeyPrefix)
      );
      if (keys.length > 0) {
        const keyValues = await AsyncStorage.multiGet(keys);
        if (hydrationGeneration !== this.hydrationGeneration) {
          return;
        }
        keyValues.forEach(([key, value]) => {
          if (value !== null) {
            this.memoryStorage.set(
              key.slice(this.fallbackKeyPrefix.length),
              value
            );
          }
        });
      }
      this.isHydrated = true;
      this.log('Hydration complete', '');

      // Notify all listeners that state might have changed after hydration
      this.listeners.forEach((set, key) => {
        const val = this.get(key);
        set.forEach((listener) => listener(val));
      });
    } catch (error) {
      console.error('[UltraStore] Failed to hydrate fallback store:', error);
    }
  }

  /**
   * Check if the store is currently using a fallback (Expo Go / Web SSR)
   */
  getUsingFallback(): boolean {
    return this.isFallback;
  }

  /**
   * Unique identifier for this StorageEngine instance.
   * Used internally to keep stores from separate engines isolated.
   */
  getInstanceId(): number {
    return this.instanceId;
  }

  /**
   * Enable debug mode
   */
  setDebug(enabled: boolean): void {
    this.debug = enabled;
  }

  /**
   * Add middleware
   */
  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Get value from storage
   */
  get<T>(key: string): T | undefined {
    this.middlewares.forEach((m) => m.onBeforeGet?.(key));

    try {
      const value = this.storage.getString(key);
      if (value === undefined || value === null) {
        return undefined;
      }

      let parsed: T | undefined;
      if (value.startsWith('s:')) {
        parsed = value.slice(2) as unknown as T;
      } else if (value.startsWith('n:')) {
        parsed = Number(value.slice(2)) as unknown as T;
      } else if (value.startsWith('b:')) {
        parsed = (value === 'b:1') as unknown as T;
      } else if (value.startsWith('j:')) {
        parsed = JSON.parse(value.slice(2)) as T;
      } else {
        parsed = JSON.parse(value) as T;
      }

      this.middlewares.forEach((m) => m.onAfterGet?.(key, parsed));
      this.log('GET', key, parsed);

      return parsed;
    } catch (error) {
      this.log('GET ERROR', key, String(error));
      return undefined;
    }
  }

  /**
   * Set value in storage
   */
  set<T>(key: string, value: T): void {
    const finalValue = this.prepareValue(key, value);

    try {
      this.storage.set(key, this.serialize(finalValue));
      this.log('SET', key);

      // Notify Global Listeners
      this.emitChange(key, finalValue);

      // Run after middleware
      this.middlewares.forEach((m) => m.onAfterSet?.(key, finalValue));
    } catch (error) {
      console.error(
        `[UltraStore] Error setting key "${key.replace(/[\r\n\t]/g, ' ').slice(0, 200)}":`,
        error
      );
    }
  }

  /**
   * Commit several values before notifying subscribers. All reads after a batch
   * notification observe the complete set of updates.
   */
  setMany(updates: Record<string, any>): void {
    const entries = Object.entries(updates).map(([key, value]) => {
      const finalValue = this.prepareValue(key, value);
      return {
        key,
        value: finalValue,
        serialized: this.serialize(finalValue),
      };
    });

    if (entries.length === 0) {
      return;
    }

    try {
      const serializedEntries = entries.map(
        ({ key, serialized }) => [key, serialized] as const
      );

      if (typeof this.storage.setMany === 'function') {
        this.storage.setMany(serializedEntries);
      } else {
        // MMKV v4 currently exposes only synchronous set(). Keeping this loop
        // inside the transaction boundary defers all notifications until every
        // value has been committed.
        serializedEntries.forEach(([key, serialized]) =>
          this.storage.set(key, serialized)
        );
      }

      entries.forEach(({ key, value }) => {
        this.log('SET', key);
        this.middlewares.forEach((middleware) =>
          middleware.onAfterSet?.(key, value)
        );
      });
      this.emitBatchChange(
        entries.map(({ key, value }) => [key, value] as const)
      );
    } catch (error) {
      console.error('[UltraStore] Error committing batch:', error);
    }
  }

  /**
   * Delete value from storage
   */
  delete(key: string): void {
    try {
      // MMKV v4 uses .remove() instead of .delete()
      if (typeof this.storage.remove === 'function') {
        this.storage.remove(key);
      } else if (typeof this.storage.delete === 'function') {
        this.storage.delete(key);
      }

      this.log('DELETE', key);
      this.emitChange(key, undefined);
      this.middlewares.forEach((m) => m.onDelete?.(key));
    } catch (error) {
      console.error(
        `[UltraStore] Error deleting key "${key.replace(/[\r\n\t]/g, ' ').slice(0, 200)}":`,
        error
      );
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    try {
      return this.storage.contains(key);
    } catch {
      return false;
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    try {
      this.storage.clearAll();
      // Prevent a late AsyncStorage hydration from restoring values that were
      // explicitly cleared while the fallback backend was still loading.
      this.hydrationGeneration += 1;
      this.isHydrated = true;
      this.log('CLEAR ALL', '');
      this.emitClearChange();
    } catch (error) {
      console.error('[UltraStore] Error clearing storage:', error);
    }
  }

  /**
   * Get all keys
   */
  getAllKeys(): string[] {
    try {
      return this.storage.getAllKeys();
    } catch (error) {
      console.error('[UltraStore] Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Get raw MMKV instance
   */
  getRawStorage(): MMKV | null {
    return this.isFallback ? null : this.storage;
  }

  /**
   * Subscribe to global changes
   */
  onChange<T>(key: string, listener: Listener<T | undefined>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(listener);
        if (keyListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * Subscribe to a committed batch. Each callback runs once per batch,
   * regardless of how many keys it contains.
   */
  onBatchChange(listener: BatchListener): () => void {
    this.batchListeners.add(listener);
    return () => this.batchListeners.delete(listener);
  }

  /** @internal Used by Store to avoid duplicate per-key batch callbacks. */
  isBatchNotificationInProgress(): boolean {
    return this.isEmittingBatch;
  }

  private prepareValue<T>(key: string, value: T): T {
    const oldValue = this.get<T>(key);
    let finalValue = value;

    for (const middleware of this.middlewares) {
      if (middleware.onBeforeSet) {
        const result = middleware.onBeforeSet(key, value, oldValue);
        if (result !== undefined) {
          finalValue = result as T;
        }
      }
    }

    return finalValue;
  }

  private serialize(value: any): string {
    if (typeof value === 'string') {
      return `s:${value}`;
    }
    if (typeof value === 'number') {
      return `n:${value}`;
    }
    if (typeof value === 'boolean') {
      return `b:${value ? '1' : '0'}`;
    }
    return `j:${JSON.stringify(value)}`;
  }

  private emitBatchChange(
    entries: ReadonlyArray<readonly [string, any]>
  ): void {
    const updates = new Map(entries);
    const notify = () => {
      this.batchListeners.forEach((listener) => {
        try {
          listener(updates);
        } catch (error) {
          console.error('[UltraStore] Error in batch listener:', error);
        }
      });

      this.isEmittingBatch = true;
      try {
        updates.forEach((value, key) => this.emitChange(key, value));
      } finally {
        this.isEmittingBatch = false;
      }
    };

    // Explicitly batch external-store updates so components subscribed to more
    // than one key render once for the committed transaction.
    if (typeof unstable_batchedUpdates === 'function') {
      unstable_batchedUpdates(notify);
    } else {
      notify();
    }
  }

  /**
   * Invalidate every active key after a namespace is cleared. Store instances
   * retain their subscriptions, but reset their in-memory value to their own
   * initial state when they receive this undefined value.
   */
  private emitClearChange(): void {
    const notify = () => {
      this.listeners.forEach((listeners, key) => {
        listeners.forEach((listener) => {
          try {
            listener(undefined);
          } catch (error) {
            console.error(
              `[UltraStore] Error in clear listener for ${key.replace(/[\r\n\t]/g, ' ').slice(0, 200)}:`,
              error
            );
          }
        });
      });
    };

    if (typeof unstable_batchedUpdates === 'function') {
      unstable_batchedUpdates(notify);
    } else {
      notify();
    }
  }

  private emitChange(key: string, value: any): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach((listener) => {
        try {
          listener(value);
        } catch (error) {
          console.error(
            `[UltraStore] Error in onChange listener for ${key.replace(/[\r\n\t]/g, ' ').slice(0, 200)}:`,
            error
          );
        }
      });
    }
  }

  /**
   * Sanitize a string for safe logging
   */
  private sanitizeLog(value: string): string {
    return String(value)
      .replace(/[\r\n\t]/g, ' ')
      .slice(0, 200);
  }

  /**
   * Debug logger
   */
  private log(action: string, key?: string, ...args: any[]): void {
    if (this.debug && __DEV__) {
      const safeKey = key !== undefined ? this.sanitizeLog(String(key)) : '';
      console.log(`[UltraStore:${action}]`, safeKey, ...args);
    }
  }
}

// Default storage instance
export const defaultStorage = new StorageEngine();

// Create custom storage instance
export const createStorage = (options?: UltraStoreOptions): StorageEngine => {
  return new StorageEngine(options);
};

export { StorageEngine };
