/**
 * useUltraStoreSetter Hook
 * Write-only hook for updating store value
 */

import { useCallback } from 'react';
import { getStore } from '../store';
import type { SetStateAction } from '../types';
import type { StorageEngine } from '../storage';

/**
 * Write-only hook to update store value
 * Use this when you only need to update, not read
 * Prevents unnecessary re-renders
 *
 * @param key - Store key
 * @param initialValue - Initial value if not persisted
 * @param storage - Optional custom storage instance
 * @returns Setter function
 *
 * @example
 * ```tsx
 * const setUser = useUltraStoreSetter('user', { name: '', token: '' });
 * setUser({ name: 'Samad' });
 * ```
 */
export function useUltraStoreSetter<T>(
  key: string,
  initialValue: T,
  storage?: StorageEngine
): (action: SetStateAction<T>) => void {
  const store = getStore(key, initialValue, storage);

  const setStoreValue = useCallback(
    (action: SetStateAction<T>) => {
      store.setValue(action);
    },
    [store]
  );

  return setStoreValue;
}
