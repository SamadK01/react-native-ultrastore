/**
 * DevTools Middleware for UltraStore
 */

import type { Middleware } from '../types';

/**
 * Built-in middleware for state inspection and logging
 */
export function createDevToolsMiddleware(): Middleware {
    return {
        onAfterSet: (key, value) => {
            if (__DEV__) {
                const timestamp = new Date().toLocaleTimeString();
                console.log(`[UltraStore:DevTools] ${timestamp} | KEY: ${key}`, {
                    value,
                });

                // Expose to global scope for inspection in Metro console
                if (typeof global !== 'undefined') {
                    if (!(global as any).__ULTRASTORE_STATE__) {
                        (global as any).__ULTRASTORE_STATE__ = {};
                    }
                    (global as any).__ULTRASTORE_STATE__[key] = value;
                }
            }
        },
        onDelete: (key) => {
            if (__DEV__ && typeof global !== 'undefined' && (global as any).__ULTRASTORE_STATE__) {
                delete (global as any).__ULTRASTORE_STATE__[key];
            }
        }
    };
}
