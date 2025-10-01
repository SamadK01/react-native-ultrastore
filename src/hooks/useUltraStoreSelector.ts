/**
 * useUltraStoreSelector Hook
 * Subscribe to partial state for optimized re-renders
 */

import { useState, useEffect, useRef } from 'react';
import { getStore } from '../store';
import type { Selector } from '../types';
import type { StorageEngine } from '../storage';

/**
 * Hook to subscribe to a selected portion of the store
 * Optimizes re-renders by only updating when selected value changes
 *
 * @param key - Store key
 * @param selector - Function to select portion of state
 * @param initialValue - Initial value for the store
 * @param storage - Optional custom storage instance
 * @returns Selected value
 *
 * @example
 * ```tsx
 * const userName = useUltraStoreSelector(
 *   'user',
 *   (user) => user.name,
 *   { name: '', token: '' }
 * );
 * ```
 */
export function useUltraStoreSelector<T, R>(
  key: string,
  selector: Selector<T, R>,
  initialValue: T,
  storage?: StorageEngine
): R {
  const store = getStore(key, initialValue, storage);
  const [selectedValue, setSelectedValue] = useState<R>(() =>
    selector(store.getValue())
  );
  const isMountedRef = useRef(true);
  const previousSelectedRef = useRef(selectedValue);

  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = store.subscribe((newValue) => {
      if (isMountedRef.current) {
        const newSelected = selector(newValue);
        // Only update if selected value changed (shallow comparison)
        if (newSelected !== previousSelectedRef.current) {
          previousSelectedRef.current = newSelected;
          setSelectedValue(newSelected);
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [store, selector]);

  return selectedValue;
}
