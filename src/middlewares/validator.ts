/**
 * Validator Middleware
 * Validates data before storing
 */

import type { Middleware } from '../types';

const sanitize = (s: string) => String(s).replace(/[\r\n\t]/g, ' ').slice(0, 200);

export type ValidationRule<T> = (value: T) => boolean | string;

/**
 * Create a validator middleware
 *
 * @param rules - Validation rules per key
 * @returns Middleware instance
 *
 * @example
 * ```tsx
 * import { defaultStorage, createValidatorMiddleware } from 'react-native-ultrastore';
 *
 * defaultStorage.use(
 *   createValidatorMiddleware({
 *     user: (value) => {
 *       if (!value.name) return 'Name is required';
 *       return true;
 *     },
 *   })
 * );
 * ```
 */
export function createValidatorMiddleware<T = any>(rules: {
  [key: string]: ValidationRule<T>;
}): Middleware<T> {
  return {
    onBeforeSet: (key, value) => {
      const rule = rules[key];
      if (rule) {
        const result = rule(value);
        if (result !== true) {
          const errorMsg =
            typeof result === 'string'
              ? sanitize(result)
              : `Validation failed for ${sanitize(key)}`;
          console.error(`[UltraStore] Validation Error: ${errorMsg}`);
          throw new Error(errorMsg);
        }
      }
    },
  };
}
