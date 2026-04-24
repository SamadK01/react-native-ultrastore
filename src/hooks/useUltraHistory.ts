import { useState, useCallback } from 'react';
import { useUltraStore } from './useUltraStore';

/**
 * Hook to manage history (undo/redo) for a specific store key.
 * 
 * @param key - The store key to track
 * @param initialValue - Initial value
 * @param options - maxHistory: number of states to keep (default 20)
 */
export function useUltraHistory<T>(
  key: string,
  initialValue: T,
  options: { maxHistory?: number } = {}
) {
  const { maxHistory = 20 } = options;
  const [value, setStoreValue] = useUltraStore<T>(key, initialValue);

  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  // Override setValue to track history
  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setStoreValue((current: T) => {
        const resolvedValue =
          typeof newValue === 'function'
            ? (newValue as Function)(current)
            : newValue;

        // Push current state to past before updating
        setPast((p) => {
          const newPast = [...p, current];
          // Limit history size
          if (newPast.length > maxHistory) {
            return newPast.slice(newPast.length - maxHistory);
          }
          return newPast;
        });
        
        // Clear future when making a new change
        setFuture([]);

        return resolvedValue;
      });
    },
    [setStoreValue, maxHistory]
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, p.length - 1));

    setStoreValue((current: T) => {
      setFuture((f) => [current, ...f]);
      return previous;
    });
  }, [past, setStoreValue]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    setFuture((f) => f.slice(1));

    setStoreValue((current: T) => {
      setPast((p) => [...p, current]);
      return next;
    });
  }, [future, setStoreValue]);

  return {
    value,
    setValue,
    undo,
    redo,
    past,
    future,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
