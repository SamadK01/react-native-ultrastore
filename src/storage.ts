/**
 * UltraStore Storage Engine
 * Powered by react-native-mmkv v4 + Nitro Modules
 */

import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';
import type { UltraStoreOptions, Middleware } from './types';

// In-memory fallback for Expo Go
const memoryStorage = new Map<string, string>();

class StorageEngine {
  private storage: any;
  private isFallback: boolean = false;
  private middlewares: Middleware[] = [];
  private debug: boolean = false;

  constructor(options?: UltraStoreOptions) {
    this.initializeStorage(options);

    if (__DEV__) {
      this.log('StorageEngine initialized', {
        id: options?.id,
        fallback: this.isFallback,
        platform: Platform.OS
      });
    }
  }

  private initializeStorage(options?: UltraStoreOptions) {
    // 1. Web Fallback
    if (Platform.OS === 'web') {
      this.isFallback = true;
      this.storage = {
        getString: (key: string) => localStorage.getItem(key),
        set: (key: string, value: string) => localStorage.setItem(key, value),
        remove: (key: string) => localStorage.removeItem(key),
        contains: (key: string) => localStorage.getItem(key) !== null,
        clearAll: () => localStorage.clear(),
        getAllKeys: () => Object.keys(localStorage),
      };
      return;
    }

    // 2. MMKV v4 Initialization with Expo Go Fallback
    try {
      // MMKV v4 recommended way is createMMKV, but class also works.
      // We check if native MMKV is available.
      this.storage = new MMKV({
        id: options?.id || 'ultrastore-default',
        encryptionKey: options?.encryptionKey,
      });

      // Verification check (will throw in Expo Go)
      this.storage.getAllKeys();
    } catch (error) {
      this.isFallback = true;
      if (__DEV__) {
        console.warn(
          '[UltraStore] MMKV native module not found. Falling back to in-memory store. ' +
          'Persistence will not work in Expo Go. Use a development build for full features.'
        );
      }
      this.storage = {
        getString: (key: string) => memoryStorage.get(key),
        set: (key: string, value: string) => memoryStorage.set(key, value),
        remove: (key: string) => memoryStorage.delete(key),
        contains: (key: string) => memoryStorage.has(key),
        clearAll: () => memoryStorage.clear(),
        getAllKeys: () => Array.from(memoryStorage.keys()),
      };
    }
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
      const parsed = value ? (JSON.parse(value) as T) : undefined;

      this.middlewares.forEach((m) => m.onAfterGet?.(key, parsed));
      this.log('GET', key, parsed);

      return parsed;
    } catch (error) {
      console.error(`[UltraStore] Error getting key "${key}":`, error);
      return undefined;
    }
  }

  /**
   * Set value in storage
   */
  set<T>(key: string, value: T): void {
    const oldValue = this.get<T>(key);

    // Run before middleware
    let finalValue = value;
    for (const middleware of this.middlewares) {
      if (middleware.onBeforeSet) {
        const result = middleware.onBeforeSet(key, value, oldValue);
        if (result !== undefined) {
          finalValue = result as T;
        }
      }
    }

    try {
      this.storage.set(key, JSON.stringify(finalValue));
      this.log('SET', key, finalValue);

      // Run after middleware
      this.middlewares.forEach((m) => m.onAfterSet?.(key, finalValue));
    } catch (error) {
      console.error(`[UltraStore] Error setting key "${key}":`, error);
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
      } else {
        this.storage.delete(key);
      }

      this.log('DELETE', key);
      this.middlewares.forEach((m) => m.onDelete?.(key));
    } catch (error) {
      console.error(`[UltraStore] Error deleting key "${key}":`, error);
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.storage.contains(key);
  }

  /**
   * Clear all data
   */
  clear(): void {
    try {
      this.storage.clearAll();
      this.log('CLEAR ALL');
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
  getRawStorage(): MMKV {
    return this.storage;
  }

  /**
   * Debug logger
   */
  private log(action: string, ...args: any[]): void {
    if (this.debug && __DEV__) {
      console.log(`[UltraStore:${action}]`, ...args);
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
