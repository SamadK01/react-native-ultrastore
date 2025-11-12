import { MMKV } from 'react-native-mmkv';
import { StorageAdapter, StorageAdapterOptions } from './types';

export class MMKVAdapter implements StorageAdapter {
  private storage: MMKV;
  private namespace: string;
  private debug: boolean;

  constructor(options: StorageAdapterOptions = {}) {
    this.namespace = options.namespace || 'ultrastore';
    this.debug = options.debug || false;
    
    this.storage = new MMKV({
      id: this.namespace,
      encryptionKey: options.encryptionKey,
    });

    if (this.debug) {
      console.log(`[MMKVAdapter] Initialized with namespace: ${this.namespace}`);
    }
  }

  private getKey(key: string): string {
    return `@${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key);
      const value = this.storage.getString(fullKey);
      if (value === undefined) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      if (this.debug) {
        console.error(`[MMKVAdapter] Error getting key ${key}:`, error);
      }
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      const serialized = JSON.stringify(value);
      this.storage.set(fullKey, serialized);
    } catch (error) {
      if (this.debug) {
        console.error(`[MMKVAdapter] Error setting key ${key}:`, error);
      }
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      this.storage.delete(fullKey);
    } catch (error) {
      if (this.debug) {
        console.error(`[MMKVAdapter] Error removing key ${key}:`, error);
      }
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      this.storage.clearAll();
    } catch (error) {
      if (this.debug) {
        console.error('[MMKVAdapter] Error clearing all data:', error);
      }
      throw error;
    }
  }

  async getKeys(): Promise<string[]> {
    try {
      return this.storage.getAllKeys();
    } catch (error) {
      if (this.debug) {
        console.error('[MMKVAdapter] Error getting keys:', error);
      }
      return [];
    }
  }

  async containsKey(key: string): Promise<boolean> {
    try {
      const fullKey = this.getKey(key);
      return this.storage.contains(fullKey);
    } catch (error) {
      if (this.debug) {
        console.error(`[MMKVAdapter] Error checking key ${key}:`, error);
      }
      return false;
    }
  }
}

export default MMKVAdapter;
