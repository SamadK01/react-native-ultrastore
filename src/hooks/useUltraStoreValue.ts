/**
 * useUltraStoreValue Hook
 * Read-only hook for accessing store value
 */

import { useState, useEffect, useRef } from 'react';
import { getStore } from '../store';
import type { StorageEngine } from '../storage';

/**
 * Read-only hook to access store value
 * Use this when you only need to read, not update
 *
 * @param key - Store key
 * @param initialValue - Initial value if not persisted
 * @param storage - Optional custom storage instance
 * @returns Current value
 *
 * @example
 * ```tsx
 * const user = useUltraStoreValue('user', { name: '', token: '' });
 * ```
 */
export function useUltraStoreValue<T>(
  key: string,
  initialValue: T,
  storage?: StorageEngine
): T {
  const store = getStore(key, initialValue, storage);
  const [value, setValue] = useState<T>(store.getValue());
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = store.subscribe((newValue) => {
      if (isMountedRef.current) {
        setValue(newValue);
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [store]);

  return value;
}
