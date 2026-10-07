export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clearAll(): void;
  getKeys(): string[];
  containsKey(key: string): boolean;
}

export type StorageAdapterType = 'mmkv' | 'sqlite' | 'secure';

export interface StorageAdapterOptions {
  encryptionKey?: string;
  namespace?: string;
  debug?: boolean;
}
