/**
 * Batch Update API for UltraStore
 */

import { useCallback } from 'react';
import { getStore } from './store';
import { defaultStorage, StorageEngine } from './storage';

/**
 * Update multiple keys in storage at once
 * Useful for performance when updating many keys
 */
export function batchSet(
    updates: Record<string, any>,
    storage: StorageEngine = defaultStorage
): void {
    Object.entries(updates).forEach(([key, value]) => {
        // We get the store for each key to ensure listeners are notified
        // but the actual write happens efficiently through MMKV
        const store = getStore(key, value, storage);
        store.setValue(value);
    });
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
