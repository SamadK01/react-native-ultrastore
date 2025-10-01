/**
 * Utility to remove a specific key from storage
 */

import { defaultStorage } from '../storage';

/**
 * Remove a specific key from storage
 *
 * @param key - Key to remove
 *
 * @example
 * ```tsx
 * import { removeKey } from 'react-native-ultrastore';
 *
 * removeKey('user');
 * ```
 */
export function removeKey(key: string): void {
  defaultStorage.delete(key);
}
