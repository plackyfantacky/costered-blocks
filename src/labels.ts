import { __ } from '@wordpress/i18n';
import strings from '../config/strings.json';

const TEXT_DOMAIN = 'costered-blocks';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

type Labels = typeof strings;

/**
 * Recursively translate a nested object of strings with wp.i18n __().
 * Non-string values are returned as-is.
 */
function translateDeep<Token extends JsonValue>(value: Token): Token {
    if (typeof value === 'string') {
        return __(value, TEXT_DOMAIN) as unknown as Token;
    }
    if (Array.isArray(value)) {
        return value.map(translateDeep) as unknown as Token;
    }
    if (value && typeof value === 'object') {
        const output: Record<string, JsonValue> = {};
        for (const [key, child] of Object.entries(value)) {
            output[key] = translateDeep(child as JsonValue);
        }
        return output as unknown as Token;
    }
    return value;
}

/**
 * Export the same shape as before, but sourced from JSON.
 * Downstream imports of LABELS remain unchanged.
 */
export const LABELS: Labels = translateDeep(strings as Labels);

/**
 * Optional helpers (use only if handy in your codebase):
 *
 * getLabel('pluginSidebar.title') – retrieves a translated value via path.
 * t('pluginSidebar.title', 'Costered Blocks') – translate by path with fallback.
 */

export function getLabel(path: string): unknown {
    return path.split('.').reduce<unknown>((accumulator, key) => {
        if (accumulator && typeof accumulator === 'object' && key in (accumulator as Record<string, unknown>)) {
            return (accumulator as Record<string, unknown>)[key];
        }
        return undefined;
    }, LABELS as unknown);
}

export function t(path: string, fallback?: string): string {
    const raw = path.split('.').reduce<unknown>((accumulator, key) => {
        if (accumulator && typeof accumulator === 'object' && key in (accumulator as Record<string, unknown>)) {
            return (accumulator as Record<string, unknown>)[key];
        }
        return undefined;
    }, LABELS as unknown);
    
    const base = typeof raw === 'string' ? raw : (fallback ?? path);
    return __(base, TEXT_DOMAIN);
}
