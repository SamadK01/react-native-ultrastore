/**
 * DevTools Middleware for UltraStore
 */

import type { Middleware } from '../types';

let devTools: any = null;
let stateCache: Record<string, any> = {};

/**
 * Built-in middleware for state inspection and logging.
 * Bridges with Redux DevTools if available.
 */
export function createDevToolsMiddleware(): Middleware {
  // Initialize Redux DevTools bridge if in DEV and on Web (or with a bridge library)
  if (__DEV__ && typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({
      name: 'UltraStore',
    });
    devTools.init(stateCache);
  }

  return {
    onAfterSet: (key, value) => {
      if (__DEV__) {
        stateCache[key] = value;
        const timestamp = new Date().toLocaleTimeString();

        // Console Logging
        console.log(`[UltraStore:DevTools] ${timestamp} | KEY: ${key}`, {
          value,
        });

        // Redux DevTools Sync
        if (devTools) {
          devTools.send({ type: `SET_${key.toUpperCase()}`, payload: value }, stateCache);
        }

        // Global state exposure for Metro
        if (typeof global !== 'undefined') {
          if (!(global as any).__ULTRASTORE_STATE__) {
            (global as any).__ULTRASTORE_STATE__ = {};
          }
          (global as any).__ULTRASTORE_STATE__[key] = value;
        }
      }
    },
    onDelete: (key) => {
      if (__DEV__) {
        delete stateCache[key];

        if (devTools) {
          devTools.send({ type: `DELETE_${key.toUpperCase()}` }, stateCache);
        }

        if (
          typeof global !== 'undefined' &&
          (global as any).__ULTRASTORE_STATE__
        ) {
          delete (global as any).__ULTRASTORE_STATE__[key];
        }
      }
    },
  };
}
