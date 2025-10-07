import { useSelect, useDispatch } from '@wordpress/data';
import { store as preferenceStore } from '@wordpress/preferences';
import { useCallback } from '@wordpress/element';

/**
 * A hook to get and set UI preferences for the current user.
 *
 * @param {string} key The preference key.
 * @param {any} defaultValue The default value if the preference is not set.
 * @returns {[any, function]} The current value and a setter function.
 */
export function useUIPreferences<Token>(
    key: string,
    defaultValue: Token,
    ns = 'costered-blocks'
): [Token, (next: Token) => void, () => void] {
    // Ensure the key is nsd to avoid collisions.
    const value = useSelect((select: any) => {
        const pref = select(preferenceStore).get(ns, key);
        const value = pref?.get?.(ns, key);
        return (value ?? defaultValue) as Token;
    }, [key, defaultValue, ns]);

    const { set, __experimentalReset: resetPref } = useDispatch(preferenceStore) as {
        set: (ns: string, k: string, v: Token) => void;
        __experimentalReset?: (ns: string, k: string) => void;
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

type ScopedKeyOptions = {
    blockName?: string | null | undefined;
    variant?: string | null | undefined;
};

/**
 * Generate a namespaced preference key.
 */
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