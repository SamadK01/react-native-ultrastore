/**
 * UltraStore Storage Engine
 * Powered by react-native-mmkv v4 + Nitro Modules
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UltraStoreOptions, Middleware, Listener } from './types';

// In-memory fallback for environments without synchronous persistent storage
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
      this.log('init', `id=${options?.id} fallback=${this.isFallback} platform=${Platform.OS}`);
    }
  }

  private initializeStorage(options?: UltraStoreOptions) {
    // 1. Web / SSR Support
    if (Platform.OS === 'web') {
      const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
      this.isFallback = !isBrowser; // If not browser, we use memory only (SSR)
      
      this.storage = {
        getString: (key: string) => (isBrowser ? localStorage.getItem(key) : memoryStorage.get(key)),
        set: (key: string, value: string) => {
          if (isBrowser) {
            localStorage.setItem(key, value);
          } else {
            memoryStorage.set(key, value);
          }
        },
        remove: (key: string) => {
          if (isBrowser) {
            localStorage.removeItem(key);
          } else {
            memoryStorage.delete(key);
          }
        },
        contains: (key: string) => (isBrowser ? localStorage.getItem(key) !== null : memoryStorage.has(key)),
        clearAll: () => {
          if (isBrowser) {
            localStorage.clear();
          } else {
            memoryStorage.clear();
          }
        },
        getAllKeys: () => (isBrowser ? Object.keys(localStorage) : Array.from(memoryStorage.keys())),
      };
      return;
    }

    // 2. Native (iOS/Android) with MMKV
    try {
      // Check if we are in Expo Go or if native module is missing
      // createMMKV might not throw immediately, so we test it
      this.storage = createMMKV({
        id: options?.id || 'ultrastore-default',
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
        getString: (key: string) => memoryStorage.get(key),
        set: (key: string, value: string) => {
          memoryStorage.set(key, value);
          AsyncStorage.setItem(key, value).catch(err => 
            console.error('[UltraStore] AsyncStorage set error:', err)
          );
        },
        remove: (key: string) => {
          memoryStorage.delete(key);
          AsyncStorage.removeItem(key).catch(err => 
            console.error('[UltraStore] AsyncStorage remove error:', err)
          );
        },
        contains: (key: string) => memoryStorage.has(key),
        clearAll: () => {
          memoryStorage.clear();
          AsyncStorage.clear().catch(err => 
            console.error('[UltraStore] AsyncStorage clear error:', err)
          );
        },
        getAllKeys: () => Array.from(memoryStorage.keys()),
      };
    }
  }

  /**
   * Hydrate memory store from AsyncStorage (Used only when MMKV fails)
   * This is important for Expo Go users to restore state on app start.
   */
  async hydrate(): Promise<void> {
    if (!this.isFallback || this.isHydrated) return;
    
    // Only hydration makes sense for native fallback (AsyncStorage)
    if (Platform.OS === 'web') {
      this.isHydrated = true;
      return;
    }

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
      this.log('Hydration complete', '');
      
      // Notify all listeners that state might have changed after hydration
      this.listeners.forEach((set, key) => {
        const val = this.get(key);
        set.forEach(listener => listener(val));
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
      this.log('GET ERROR', key, String(error));
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
      this.log('SET', key);

      // Notify Global Listeners
      this.emitChange(key, finalValue);

      // Run after middleware
      this.middlewares.forEach((m) => m.onAfterSet?.(key, finalValue));
    } catch (error) {
      console.error(`[UltraStore] Error setting key "${key.replace(/[\r\n\t]/g, ' ').slice(0, 200)}":`, error);
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
      console.error(`[UltraStore] Error deleting key "${key.replace(/[\r\n\t]/g, ' ').slice(0, 200)}":`, error);
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
      this.log('CLEAR ALL', '');
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

  private emitChange(key: string, value: any): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach((listener) => {
        try {
          listener(value);
        } catch (error) {
          console.error(`[UltraStore] Error in onChange listener for ${key.replace(/[\r\n\t]/g, ' ').slice(0, 200)}:`, error);
        }
      });
    }
  }

  /**
   * Sanitize a string for safe logging
   */
  private sanitizeLog(value: string): string {
    return String(value).replace(/[\r\n\t]/g, ' ').slice(0, 200);
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
