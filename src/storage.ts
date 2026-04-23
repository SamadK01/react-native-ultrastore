/**
 * UltraStore Storage Engine
 * Powered by react-native-mmkv v4 + Nitro Modules
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UltraStoreOptions, Middleware, Listener } from './types';

// In-memory fallback for Expo Go
const memoryStorage = new Map<string, string>();

class StorageEngine {
  private storage: any;
  private isFallback: boolean = false;
  private isHydrated: boolean = false;
  private middlewares: Middleware[] = [];
  private listeners = new Map<string, Set<Listener<any>>>();
  private debug: boolean = false;

  constructor(options?: UltraStoreOptions) {
    this.initializeStorage(options);

    if (__DEV__) {
      this.log('StorageEngine initialized', {
        id: options?.id,
        fallback: this.isFallback,
        platform: Platform.OS,
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
      this.storage = createMMKV({
        id: options?.id || 'ultrastore-default',
        encryptionKey: options?.encryptionKey,
      });

      // Verification check (will throw in Expo Go)
      this.storage.getAllKeys();
    } catch (error) {
      this.isFallback = true;
      if (__DEV__) {
        console.warn(
          '[UltraStore] MMKV native module not found. Falling back to AsyncStorage + Memory. ' +
            'Ensure you call await storage.hydrate() before using the store synchronously.'
        );
      }
      this.storage = {
        getString: (key: string) => memoryStorage.get(key),
        set: (key: string, value: string) => {
          memoryStorage.set(key, value);
          AsyncStorage.setItem(key, value).catch(console.error);
        },
        remove: (key: string) => {
          memoryStorage.delete(key);
          AsyncStorage.removeItem(key).catch(console.error);
        },
        contains: (key: string) => memoryStorage.has(key),
        clearAll: () => {
          memoryStorage.clear();
          AsyncStorage.clear().catch(console.error);
        },
        getAllKeys: () => Array.from(memoryStorage.keys()),
      };
    }
  }

  /**
   * Hydrate memory store from AsyncStorage (Used only when MMKV fails)
   */
  async hydrate(): Promise<void> {
    if (!this.isFallback || this.isHydrated) return;
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (keys.length > 0) {
        const keyValues = await AsyncStorage.multiGet(keys);
        keyValues.forEach(([key, value]) => {
          if (value !== null) {
            memoryStorage.set(key, value);
          }
        });
      }
      this.isHydrated = true;
      this.log('Hydration complete');
    } catch (error) {
      console.error('[UltraStore] Failed to hydrate fallback store:', error);
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

      // Notify Global Listeners
      this.emitChange(key, finalValue);

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
      this.emitChange(key, undefined);
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

  private emitChange(key: string, value: any): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach((listener) => {
        try {
          listener(value);
        } catch (error) {
          console.error(`[UltraStore] Error in onChange listener for ${key}:`, error);
        }
      });
    }
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
