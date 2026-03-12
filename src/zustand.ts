/**
 * Zustand Adapter for UltraStore
 */

import { StorageEngine, defaultStorage } from './storage';

/**
 * Creates a Zustand-compatible storage adapter backed by UltraStore
 * 
 * @example
 * ```ts
 * import { createUltraZustandStorage } from 'react-native-ultrastore/zustand';
 * 
 * const useStore = create(
 *   persist(
 *     (set) => ({ ... }),
 *     {
 *       name: 'my-storage',
 *       storage: createJSONStorage(() => createUltraZustandStorage()),
 *     }
 *   )
 * );
 * ```
 */
export const createUltraZustandStorage = (storage: StorageEngine = defaultStorage) => ({
    getItem: (name: string): string | null => {
        const value = storage.get(name);
        return value !== undefined ? JSON.stringify(value) : null;
    },
    setItem: (name: string, value: string): void => {
        try {
            storage.set(name, JSON.parse(value));
        } catch (e) {
            storage.set(name, value);
        }
    },
    removeItem: (name: string): void => {
        storage.delete(name);
    },
});
