// src/utils/debug.ts

declare global {
    interface Window {
        COSTERED_DEBUG?: boolean;
    }
}

/**
 * Namespaced console logger gated by window.COSTERED_DEBUG.
 */
export function log(...args: unknown[]): void {
    if (typeof window !== 'undefined' && !window.COSTERED_DEBUG) return;
    // namespaced so it’s searchable in console
    // eslint-disable-next-line no-console
    console.log('[CosteredBlocks]', ...args);
}
