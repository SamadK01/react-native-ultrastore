/**
 * UltraStore Storage Engine
 * Powered by react-native-mmkv
 */

import { MMKV } from 'react-native-mmkv';
import type { UltraStoreOptions, Middleware } from './types';

class StorageEngine {
  private storage: MMKV;
  private middlewares: Middleware[] = [];
  private debug: boolean = false;

  constructor(options?: UltraStoreOptions) {
    this.storage = new MMKV({
      id: options?.id || 'ultrastore-default',
      encryptionKey: options?.encryptionKey,
    });

    if (__DEV__) {
      this.log('StorageEngine initialized', options);
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
      this.storage.delete(key);
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
