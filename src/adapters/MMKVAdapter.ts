import { createMMKV, type MMKV } from 'react-native-mmkv';
import { StorageAdapter, StorageAdapterOptions } from './types';

const sanitize = (s: string) => String(s).replace(/[\r\n\t]/g, ' ').slice(0, 200);

export class MMKVAdapter implements StorageAdapter {
  private storage: MMKV;
  private namespace: string;
  private debug: boolean;

  constructor(options: StorageAdapterOptions = {}) {
    this.namespace = options.namespace || 'ultrastore';
    this.debug = options.debug || false;

    this.storage = createMMKV({
      id: this.namespace,
      encryptionKey: options.encryptionKey,
    });

    if (this.debug) {
      console.log(`[MMKVAdapter] Initialized with namespace: ${sanitize(this.namespace)}`);
    }
  }

  private getKey(key: string): string {
    return `@${this.namespace}:${key}`;
  }

  get<T>(key: string): T | null {
    try {
      const fullKey = this.getKey(key);
      const raw = this.storage.getString(fullKey);
      if (raw === undefined || raw === null) {
        return null;
      }
      if (raw.startsWith('s:')) return raw.slice(2) as unknown as T;
      if (raw.startsWith('n:')) return Number(raw.slice(2)) as unknown as T;
      if (raw.startsWith('b:')) return (raw === 'b:1') as unknown as T;
      if (raw.startsWith('j:')) return JSON.parse(raw.slice(2)) as T;
      return JSON.parse(raw) as T;
    } catch (error) {
      if (this.debug) {
        console.error(`[MMKVAdapter] Error getting key ${sanitize(key)}:`, error);
      }
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      const fullKey = this.getKey(key);
      let serialized: string;
      if (typeof value === 'string') {
        serialized = `s:${value}`;
      } else if (typeof value === 'number') {
        serialized = `n:${value}`;
      } else if (typeof value === 'boolean') {
        serialized = `b:${value ? '1' : '0'}`;
      } else {
        serialized = `j:${JSON.stringify(value)}`;
      }
      this.storage.set(fullKey, serialized);
    } catch (error) {
      if (this.debug) {
        console.error(`[MMKVAdapter] Error setting key ${sanitize(key)}:`, error);
      }
      throw error;
    }
  }

  remove(key: string): void {
    try {
      const fullKey = this.getKey(key);
      this.storage.remove(fullKey);
    } catch (error) {
      if (this.debug) {
        console.error(`[MMKVAdapter] Error removing key ${sanitize(key)}:`, error);
      }
      throw error;
    }
  }

  clearAll(): void {
    try {
      this.storage.clearAll();
    } catch (error) {
      if (this.debug) {
        console.error('[MMKVAdapter] Error clearing all data:', error);
      }
      throw error;
    }
  }

  getKeys(): string[] {
    try {
      return this.storage.getAllKeys();
    } catch (error) {
      if (this.debug) {
        console.error('[MMKVAdapter] Error getting keys:', error);
      }
      return [];
    }
  }

  containsKey(key: string): boolean {
    try {
      const fullKey = this.getKey(key);
      return this.storage.contains(fullKey);
    } catch (error) {
      if (this.debug) {
        console.error(`[MMKVAdapter] Error checking key ${sanitize(key)}:`, error);
      }
      return false;
    }
  }
}

export default MMKVAdapter;
