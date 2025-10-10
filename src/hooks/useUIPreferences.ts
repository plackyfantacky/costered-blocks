import { useSelect, useDispatch } from '@wordpress/data';
import { store as preferenceStore } from '@wordpress/preferences';
import { useCallback } from '@wordpress/element';


/**
 * Helper to read a preference value, trying various access patterns to support different WP versions.
 */
function readPref<Token>(select: any, store: any, ns: string, key: string): Token | undefined {
    const api = select(store);

    try {
        const direct = api?.get?.(ns, key);
        if (direct !== undefined) return direct as Token;
    } catch { /* noop */ }

    try {
        const scoped = api?.get?.(ns);
        if (scoped !== undefined && scoped !== null) {
            //map like?
            const viaMap = (scoped as any)?.get?.(key);
            if (viaMap !== undefined) return viaMap as Token;

            //object like?
            const viaProp = (scoped as any)?.[key];
            if (viaProp !== undefined) return viaProp as Token;
        }
    } catch { /* noop */ }
    
    return undefined;
}

/**
 * A hook to get and set UI preferences for the current user.
 */
export function useUIPreferences<Token>(
    key: string,
    defaultValue: Token,
    ns = 'costered-blocks'
): [Token, (next: Token) => void, () => void] {
    // Ensure the key is nsd to avoid collisions.
    const value = useSelect((select: any) => {
        const stored = readPref<Token>(select, preferenceStore, ns, key);
        return (stored === undefined ? defaultValue : stored) as Token;
    }, [key, ns]);

    const { set, __experimentalReset: resetPref } = useDispatch(preferenceStore) as {
        set: (scope: string, k: string, v: Token) => void;
        __experimentalReset?: (scope: string, k: string) => void;
    };

    const setValue = useCallback((next: Token) => {
        if (key.startsWith('__invalid__')) return; // Prevent accidental writes to unscoped keys.
        set(ns, key, next);
    }, [key, ns, set]);

    const reset = useCallback(() => {
        if (key.startsWith('__invalid__')) return; // Prevent accidental writes to unscoped keys.
        resetPref?.(ns, key);
    }, [key, ns, resetPref]);

    return [value, setValue, reset];
}

/**
 * Generate a namespaced preference key.
 */
type ScopedKeyOptions = {
    blockName?: string | null | undefined;
    variant?: string | null | undefined;
};

export function useScopedKey(
    base: string,
    opts: ScopedKeyOptions = {}
): string {
    const normalise = (value?: string | null): string | undefined => {
        if (value === null) return undefined;
        const trimmed = value?.trim();
        if (!trimmed) return undefined;
        return encodeURIComponent(trimmed);
    };

    const blockName = normalise(opts.blockName);
    const variant = normalise(opts.variant);

    if (!blockName && !variant) return base;
    if (blockName && !variant) return `${base}:${blockName}`;
    if (!blockName && variant) return `${base}#${variant}`;
    return `${base}:${blockName}#${variant}`;
};