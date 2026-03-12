/**
 * Atom API for UltraStore
 * Composable, atomic state model inspired by Jotai
 */

import { useUltraStore } from './hooks/useUltraStore';
import type { StorageEngine } from './storage';

export interface Atom<T> {
    key: string;
    initialValue: T;
    storage?: StorageEngine;
}

/**
 * Create an atomic unit of state
 */
export function createAtom<T>(
    key: string,
    initialValue: T,
    storage?: StorageEngine
): Atom<T> {
    return { key, initialValue, storage };
}

/**
 * Hook to use an atom in a component
 */
export function useUltraAtom<T>(atom: Atom<T>) {
    return useUltraStore(atom.key, atom.initialValue, atom.storage);
}
