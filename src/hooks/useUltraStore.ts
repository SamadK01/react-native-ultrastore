/**
 * useUltraStore Hook
 * Main hook for state + persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getStore } from '../store';
import type { SetStateAction } from '../types';
import type { StorageEngine } from '../storage';

/**
 * Main hook for UltraStore
 * Combines state management with automatic persistence
 *
 * @param key - Unique key for the store
 * @param initialValue - Initial value if not persisted
 * @param storage - Optional custom storage instance
 * @returns [value, setValue] tuple
 *
 * @example
 * ```tsx
 * const [user, setUser] = useUltraStore('user', { name: '', token: '' });
 * setUser({ name: 'Samad' }); // updates state and persists
 * ```
 */
export function useUltraStore<T>(
  key: string,
  initialValue: T,
  storage?: StorageEngine
): [T, (action: SetStateAction<T>) => void] {
  const store = getStore(key, initialValue, storage);
  const [value, setValue] = useState<T>(store.getValue());
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Subscribe to store changes
    const unsubscribe = store.subscribe((newValue) => {
      if (isMountedRef.current) {
        setValue(newValue);
      }
    });

    // Cleanup
    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [store]);

  const setStoreValue = useCallback(
    (action: SetStateAction<T>) => {
      store.setValue(action);
    },
    [store]
  );

  return [value, setStoreValue];
}
