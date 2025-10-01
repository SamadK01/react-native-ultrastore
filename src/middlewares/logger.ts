/**
 * Logger Middleware
 * Logs all storage operations
 */

import type { Middleware } from '../types';

/**
 * Create a logger middleware for debugging
 *
 * @param options - Logger options
 * @returns Middleware instance
 *
 * @example
 * ```tsx
 * import { defaultStorage, createLoggerMiddleware } from 'react-native-ultrastore';
 *
 * defaultStorage.use(createLoggerMiddleware({ collapsed: true }));
 * ```
 */
export function createLoggerMiddleware(options?: {
  collapsed?: boolean;
  colors?: boolean;
}): Middleware {
  const { collapsed = false, colors = true } = options || {};

  return {
    onBeforeSet: (key, value, oldValue) => {
      if (__DEV__) {
        const groupFn = collapsed ? console.groupCollapsed : console.group;
        groupFn(
          `%c[UltraStore] SET ${key}`,
          colors ? 'color: #4CAF50; font-weight: bold' : ''
        );
        console.log('Old Value:', oldValue);
        console.log('New Value:', value);
        console.groupEnd();
      }
    },
    onAfterGet: (key, value) => {
      if (__DEV__) {
        console.log(
          `%c[UltraStore] GET ${key}`,
          colors ? 'color: #2196F3; font-weight: bold' : '',
          value
        );
      }
    },
    onDelete: (key) => {
      if (__DEV__) {
        console.log(
          `%c[UltraStore] DELETE ${key}`,
          colors ? 'color: #F44336; font-weight: bold' : ''
        );
      }
    },
  };
}
