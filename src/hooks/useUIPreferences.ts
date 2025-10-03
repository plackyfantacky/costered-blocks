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

/**
 * Generate a namespaced preference key.
 *
 * @param {string} base The base key.
 * @param {Object} options Options for namespacing.
 * @param {string} [options.blockName] The block name to namespace by.
 * @param {string} [options.variant] An additional variant to namespace by.
 * @returns {string} The namespaced key.
 */
export function useScopedKey(
    base: string,
    opts: { blockName?: string; variant?: string } = {}
): string {
    const { blockName, variant } = opts;
    if (!blockName && !variant) return base;
    if (blockName && !variant) return `${base}:${blockName}`;
    if (!blockName && variant) return `${base}#${variant}`;
    return `${base}:${blockName}#${variant}`;
};