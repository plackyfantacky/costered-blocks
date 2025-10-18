// src/utils/gridPlacement.ts


/**
 * Clamp a number between min and max (inclusive).
 */
export function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
}

/** 
 * Ensure a number is at least min.
 */
export function atLeast(n: number, min: number): number {
    return Math.max(n, min);
}

/**
 * Convert to integer, or fallback if not a finite number.
 */
export function toInt(value: unknown, fallback = 1): number {
    const num = Number(value);
    return Number.isFinite(num) ? Math.trunc(num) : fallback;
};

/**
 * Is this token an integer (number or string)?
 */
export function isIntToken(token: unknown): boolean {
    if (typeof token === 'number') return Number.isInteger(token);
    const tokenString = String(token);
    return /^-?\d+$/.test(tokenString);
}

/**
 * Convert to signed integer, or fallback if not a finite non-zero number.
 */
export function toSignedLine(value: unknown, fallback: number = 1): number {
    const num = Number.parseInt(String(value), 10);
    return Number.isFinite(num) && num !== 0 ? num : fallback; //0 is invalid in CSS Grid
}

/** 
 * Convert to signed integer, or '' if not a finite non-zero number.
 * Useful for controlled inputs where '' means "not set".
 */
export function parseSigned(value: number): number | '' {
    const num = Number.parseInt(String(value), 10);
    return Number.isFinite(num) ? num : '';
}

/** 
 * Is this token a zero (number 0 or string "0" with optional spaces)? 
 */
export function isZeroToken(value: unknown): boolean {
    if (typeof value === 'number') return value === 0;
    if (typeof value === 'string') return /^\s*0\s*$/.test(value);
    return false;
}

/** 
 * Returns { start, span } from shorthand like "2 / span 3" or "auto / 4" or "5".
 * Supports negative spans ("span -3") for backwards placement.
 */
export const parsePlacementSimple = (input: unknown): { start: number, span: number } => {
    const value = String(input ?? '').trim();
    if (!value) return { start: 1, span: 1 };

    const parts = value.split('/').map((part) => part.trim());
    if (parts.length === 1) {
        // e.g. "2"
        return { start: toInt(parts[0], 1), span: 1 };
    }

    const left = parts[0]!;
    const right = parts[1]!;
    
    // Allow both positive and negative spans
    const match = /^span\s+(-?\d+)$/i.exec(right);

    return {
        start: left === 'auto' ? 1 : toInt(left, 1),
        span: match ? toInt(match[1], 1) : 1
    };
}

/*
 * Returns a CSS placement string from start/span or start/end.
 */
export const composePlacementSimple = (
    start: unknown,
    span: unknown,
    collapseSpanOne: boolean = true
): string => {
    const outputStart = String(start ?? '').trim() || 'auto';
    const num = toInt(span, 1);
    if (collapseSpanOne && num === 1 && outputStart !== 'auto') return outputStart; // "2 / span 1" -> "2"
    return `${outputStart} / span ${num}`;
}

/*
 * Returns { start, span, end } from advanced shorthand like "2 / span 3" or "auto / 4" or "5 / auto" or "2 / 5".
 */
export const parsePlacementAdvanced = (
    input: unknown
): { start: string; span: string; end: string } => {
    const output = { start: '', span: '', end: '' };
    const value = String(input ?? '').trim();
    if (!value) return output;

    const parts = value.split('/').map((part) => part.trim());
    if (parts.length === 1) {

        if (/^span\s+\d+$/i.test(parts[0]!)) output.span = parts[0]!.replace(/^span\s+/i, '');
        else output.start = parts[0]!;
        return output;
    }
    const left = parts[0]!
    const right = parts[1]!;
    output.start = left || 'auto';
    const m = /^span\s+(\d+)$/i.exec(right);
    if (m) output.span = m[1]!;
    else output.end = right;
    return output;
}

/**
 * Compose a CSS placement string from advanced shorthand.
 */
export const composePlacementAdvanced = (
    {start, span, end}: {start?: unknown; span?: unknown; end?: unknown},
    {mode = 'span', collapseSpanOne = true}: {mode?: 'span' | 'end', collapseSpanOne?: boolean} = {}
): string => {
    const outputStart = String(start ?? '').trim() || 'auto';
    if (mode === 'end') {
        const outputEnd = String(end ?? '').trim() || 'auto';
        return `${outputStart} / ${outputEnd}`;
    }
    const num = toInt(span, 1);
    if (collapseSpanOne && num === 1 && outputStart !== 'auto') return outputStart; // "2 / span 1" -> "2"
    return `${outputStart} / span ${num}`;
}

/**
 * Extract named lines from a grid template string.
 */
export const extractNamedLines = (template: unknown): string[] => {
    const names = new Set<string>();
    const regex = /\[([^\]]+)\]/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(String(template ?? ''))) !== null) {
        const chunk = match[1]!.trim();
        if (!chunk) continue;
        chunk.split(/\s+/).forEach((name) => names.add(name));
    }
    return Array.from(names);
}

// Detects anything that looks like a line placement shorthand
export const isGridPlacement = (value: unknown): boolean => 
    /\//.test(String(value ?? '')) || /\bspan\s+\d+\b/i.test(String(value ?? ''));

// Basic validity for a named grid area (<custom-ident>-ish, practical subset)
// - non-empty string
// - no whitespace or slashes or quotes
// - not a known CSS-wide keyword
export const isValidGridAreaName = (input: unknown): boolean => {
    const value = String(input ?? '').trim();
    if (!value) return false;
    if (isGridPlacement(value)) return false;
    if (/[\s\/"']/.test(value)) return false;
    if (/^(auto|inherit|initial|unset|revert|revert-layer)$/i.test(value)) return false;
    return true;
};

// Normalise: return a valid name or '' (caller decides how to handle '')
export const normaliseGridAreaName = (value: unknown): string => 
    isValidGridAreaName(value) ? String(value).trim() : '';