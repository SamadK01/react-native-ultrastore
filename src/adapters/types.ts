export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clearAll(): Promise<void>;
  getKeys(): Promise<string[]>;
  containsKey(key: string): Promise<boolean>;
}

export type StorageAdapterType = 'mmkv' | 'sqlite' | 'secure';

export interface StorageAdapterOptions {
  encryptionKey?: string;
  namespace?: string;
  debug?: boolean;
}
