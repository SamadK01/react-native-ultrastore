import { useState, useEffect, useRef } from 'react';
import { defaultStorage } from '../storage';

/**
 * useDerived 
 * Computes a derived state from multiple store keys.
 * Only re-renders when the derived result changes or dependencies update.
 */
export function useDerived<T extends any[], R>(
  keys: string[],
  compute: (...args: T) => R
): R {
  // Helper to fetch current values for all keys
  const getValues = () => keys.map((k) => defaultStorage.get(k)) as T;

  const [value, setValue] = useState<R>(() => compute(...getValues()));
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const unsubscribers = keys.map((key) =>
      defaultStorage.onChange(key, () => {
        if (isMounted.current) {
          setValue(compute(...getValues()));
        }
      })
    );

    return () => {
      isMounted.current = false;
      unsubscribers.forEach((unsub) => unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(keys), compute]);

  return value;
}
