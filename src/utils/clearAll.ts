/**
 * Utility to clear all UltraStore data
 */

import { defaultStorage } from '../storage';
import { clearStoreRegistry } from '../store';

/**
 * Clear all data from UltraStore
 * Removes all persisted data and resets store registry
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
  clearStoreRegistry();
}
