import { useSelect, useDispatch } from '@wordpress/data';
import { store as preferenceStore } from '@wordpress/preferences';
import { MUST_BE_SCOPED } from '@config';

/**
 * A hook to get and set UI preferences for the current user.
 *
 * @param {string} key The preference key.
 * @param {any} defaultValue The default value if the preference is not set.
 * @returns {[any, function]} The current value and a setter function.
 */
export function useUIPreferences(key, defaultValue, ns = 'costered-blocks') {
    const value = useSelect(
        (select) => select(preferenceStore).get(ns, key) ?? defaultValue,
        [ns, key, defaultValue]
    );

    const { set, __experimentalReset: resetPref } = useDispatch(preferenceStore);

    const setValue = (next) => {
        if(key.startsWith('__invalid__')) return; // Prevent accidental writes to unscoped keys.
        set(ns, key, next);
    };

    const reset = () => {
        if(key.startsWith('__invalid__')) return; // Prevent accidental writes to unscoped keys.
        resetPref?.(ns, key);
    };
    
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
export const scopedKey = (base, { blockName, variant } = {}) => {
    // Examples: 'dimensionMode', 'dimensionMode:core/image', 'dimensionMode:core/image#min'
    const needsScope = MUST_BE_SCOPED.has(base);
    const hasScope = !!blockName || !!variant;
    /* TODO: sometimes the blockName is not available, so we're stuck with the bare key without suffix.
    not harmful, but not ideal. We quarantine these now to avoid accidental overwrites.
    but we should revisit this. */
    if (needsScope && !hasScope) {
        // Redirect to a quarantined bucket so we NEVER touch the bare base key again.
        return `${base}:__unscoped__`;
    }
    if (!blockName && !variant) return base;
    if (blockName && !variant) return `${base}:${blockName}`;
    if (!blockName && variant) return `${base}#${variant}`;
    return `${base}:${blockName}#${variant}`;
};