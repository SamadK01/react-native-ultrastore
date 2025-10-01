/**
 * Namespace utility for creating isolated stores
 */

import { createStorage, StorageEngine } from '../storage';
import type { UltraStoreOptions } from '../types';

/**
 * Create a namespaced storage instance
 * Useful for separating different domains (e.g., user, cart, settings)
 *
 * @param namespace - Unique namespace identifier
 * @param options - Storage options
 * @returns Storage instance for the namespace
 *
 * @example
 * ```tsx
 * const userStorage = createNamespace('user');
 * const cartStorage = createNamespace('cart');
 *
 * const [user, setUser] = useUltraStore('profile', {}, userStorage);
 * const [cart, setCart] = useUltraStore('items', [], cartStorage);
 * ```
 */
export function createNamespace(
  namespace: string,
  options?: Omit<UltraStoreOptions, 'id'>
): StorageEngine {
  return createStorage({
    ...options,
    id: `ultrastore-${namespace}`,
  });
}
