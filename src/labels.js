import { __ } from '@wordpress/i18n';
import strings from '../config/strings.json' with { type: 'json' };

const TEXT_DOMAIN = 'costered-blocks';

/**
 * Recursively translate a nested object of strings with wp.i18n __().
 * Non-string values are returned as-is.
 */
function translateDeep(value) {
    if (typeof value === 'string') {
        return __(value, TEXT_DOMAIN);
    }
    if (Array.isArray(value)) {
        return value.map(translateDeep);
    }
    if (value && typeof value === 'object') {
        const output = {};
        for (const [key, child] of Object.entries(value)) {
            output[key] = translateDeep(child);
        }
        return output;
    }
    return value;
}

/**
 * Export the same shape as before, but sourced from JSON.
 * Downstream imports of LABELS remain unchanged.
 */
export const LABELS = translateDeep(strings);

/**
 * Optional helpers (use only if handy in your codebase):
 *
 * getLabel('pluginSidebar.title') – retrieves a translated value via path.
 * t('pluginSidebar.title', 'Costered Blocks') – translate by path with fallback.
 */

export function getLabel(path) {
    return path.split('.').reduce((accumulator, key) => (
        accumulator && accumulator[key] !== undefined 
            ? accumulator[key] 
            : undefined), LABELS
    );
}

export function t(path, fallback) {
    const raw = path.split('.').reduce((accumulator, key) => (
        accumulator && accumulator[key] !== undefined 
            ? accumulator[key] 
            : undefined), strings);
    const base = typeof raw === 'string' ? raw : (fallback ?? path);
    return __(base, TEXT_DOMAIN);
}
