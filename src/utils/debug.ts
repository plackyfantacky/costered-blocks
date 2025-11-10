// src/utils/debug.ts

declare global {
    interface Window {
        COSTERED_DEBUG?: boolean;
    }
}

export type DebugLog = {
    (...args: unknown[]): void;
    group: (...args: unknown[]) => void;
    end: () => void;
};

/** Console logger that only runs when localStorage.debug === '1'. */
export const dbg: DebugLog = (() => {
    const isEnabled = (() => {
        try {
            return typeof window !== 'undefined' && window.localStorage.getItem('debug') === '1';
        } catch {
            return false; // SSR/sandbox: stay silent
        }
    })();

    const log = (...args: unknown[]) => {
        if (!isEnabled) return;
        // eslint-disable-next-line no-console
        console.log(...args);
    };

    log.group = (...args: unknown[]) => {
        if (!isEnabled) return;
        // eslint-disable-next-line no-console
        console.groupCollapsed(...args);
    };

    log.end = () => {
        if (!isEnabled) return;
        try {
            // eslint-disable-next-line no-console
            console.groupEnd();
        } catch { /* ignore */ }
    };

    return log;
})();