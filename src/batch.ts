/**
 * Batch Update API for UltraStore
 */

import { useCallback } from 'react';
import { defaultStorage, StorageEngine } from './storage';

/**
 * Update multiple keys in storage at once
 * Useful for performance when updating many keys
 */
export function batchSet(
  updates: Record<string, any>,
  storage: StorageEngine = defaultStorage
): void {
  storage.setMany(updates);
}

/**
 * Hook to update multiple store keys at once
 */
export function useBatchUpdate(storage?: StorageEngine) {
  return useCallback(
    (updates: Record<string, any>) => {
      batchSet(updates, storage);
    },
    [storage]
  );
}
