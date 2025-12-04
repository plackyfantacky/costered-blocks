// tests/mocks/wp-i18n.ts
// Minimal mock for @wordpress/i18n used in our tests.

export function __(text: string, domain?: string): string {
    return text;
}

export function _x(text: string, context?: string, domain?: string): string {
    return text;
}

export function _n(
    single: string,
    plural: string,
    count: number,
    domain?: string
): string {
    return count === 1 ? single : plural;
}

export function sprintf(format: string, ...args: unknown[]): string {
    // Naive implementation is fine for our tests; we just need something stable.
    return [format, ...args].join(' ');
}

export default {
    __,
    _x,
    _n,
    sprintf
};
