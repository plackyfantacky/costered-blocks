/** value must already be a string with no whitespace. */
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * turn unknown into a trimmed string, or null when empty/meaningless.
 * filters out '', 'undefined', 'null' (case-insensitive), but preserves '0'.
 */
export function asNonEmptyString(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    const str = String(value).trim();
    if (!str) return null;
    const lower = str.toLowerCase();
    if (lower === 'undefined' || lower === 'null') return null;
    return str;
}

type FormatOptions = {
    trim?: boolean;
    toLower?: boolean;
    toUpper?: boolean;
    toCapitalFirst?: boolean;
    toCapitalCase?: boolean;
    toCamelCase?: boolean;
    toDashes?: boolean;
    toSpaces?: boolean;
}

export function maybeFormat(
    input: unknown = '',
    formatting: FormatOptions = {}
): string {
    const {
        trim = true,
        toLower = false,
        toUpper = false,
        toCapitalFirst = false,
        toCapitalCase = false,
        toCamelCase = false,
        toDashes = false,
        toSpaces = false,
    } = formatting;

    let output = typeof input === 'string' ? input : String(input);

    
    if (trim) output = output.trim();
    if (toLower) output = output.toLowerCase();
    if (toUpper) output = output.toUpperCase();

    if (toCapitalFirst && output.length) {
        output = output.charAt(0).toUpperCase() + output.slice(1);
    }

    if (toCapitalCase) {
        output = output.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    if (toCamelCase) {
        output = output
            .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ''))
            .replace(/^(.)/, (c) => c.toLowerCase());
    }

    // spaces/underscores -> dashes
    if (toDashes) {
        output = output
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    }

    // dashes/underscores/camelCase -> spaces
    if (toSpaces) {
        output = output
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[-_]+/g, ' ')
            .toLowerCase();
    }
    return output;
}