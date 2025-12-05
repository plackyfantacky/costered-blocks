// src/utils/debug.ts

declare global {
    interface Window {
        CB_WP_DEBUG?: boolean;
    }
}

/**
 * Namespaced console logger gated by window.CB_WP_DEBUG.
 */
export function log(...args: unknown[]): void {
    if (typeof window !== 'undefined' && !window.CB_WP_DEBUG) return;
    // namespaced so it’s searchable in console
    // eslint-disable-next-line no-console
    console.log('[CosteredBlocks]', ...args);
}

export function dbg(ns: string) {
    const enabled = (() => {
        try { return /(^|,)grid(?=,|$)/.test(localStorage.getItem('debug') || ''); }
        catch { return true; } // SSR/sandbox: default on
    })();
    const p = (label: string, ...args: unknown[]) => {
        if (!enabled) return;
        // eslint-disable-next-line no-console
        console.log(`%c[${ns}]`, 'color:#6b5b95', label, ...args);
    };
    p.group = (label: string, ...args: unknown[]) => enabled && console.groupCollapsed(`%c[${ns}]`, 'color:#6b5b95', label, ...args);
    p.end   = () => enabled && console.groupEnd();
    p.trace = (label: string, ...args: unknown[]) => enabled && (console.groupCollapsed(`%c[${ns}]`, 'color:#6b5b95', label, ...args), console.trace(), console.groupEnd());
    return p;
}
