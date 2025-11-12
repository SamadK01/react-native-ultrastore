/**
 * UltraStore Types
 */

// Global type declarations
declare const __DEV__: boolean;

export type Listener<T> = (value: T) => void;

export interface StoreConfig {
  /**
   * Enable encryption for sensitive data
   */
  encrypted?: boolean;
  /**
   * Custom storage instance ID (for namespaces)
   */
  instanceId?: string;
  /**
   * Enable debug logging
   */
  debug?: boolean;
}

export interface UltraStoreOptions {
  /**
   * Enable encryption for the entire store
   */
  encryptionKey?: string;
  /**
   * Custom MMKV instance ID
   */
  id?: string;
}

export interface Middleware<T = any> {
  onBeforeSet?: (key: string, value: T, oldValue: T | undefined) => T | void;
  onAfterSet?: (key: string, value: T) => void;
  onBeforeGet?: (key: string) => void;
  onAfterGet?: (key: string, value: T | undefined) => void;
  onDelete?: (key: string) => void;
}

export type SetStateAction<T> = T | ((prevState: T) => T);

export type Selector<T, R> = (state: T) => R;
