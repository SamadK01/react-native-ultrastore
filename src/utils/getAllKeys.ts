/**
 * Utility to get all keys from storage
 */

import { defaultStorage } from '../storage';

/**
 * Get all keys from storage
 *
 * @returns Array of all keys
 *
 * @example
 * ```tsx
 * import { getAllKeys } from 'react-native-ultrastore';
 *
 * const keys = getAllKeys();
 * console.log(keys); // ['user', 'cart', 'settings']
 * ```
 */
export function getAllKeys(): string[] {
  return defaultStorage.getAllKeys();
}
