/**
 * Utility to clear all UltraStore data
 */

import { defaultStorage } from '../storage';

/**
 * Clear all data from UltraStore
 * Removes all persisted data and invalidates active stores.
 *
 * @example
 * ```tsx
 * import { clearAll } from 'react-native-ultrastore';
 *
 * // On logout
 * clearAll();
 * ```
 */
export function clearAll(): void {
  defaultStorage.clear();
}
