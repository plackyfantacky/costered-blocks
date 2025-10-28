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
): { 
    start: string; 
    span: string; 
    end: string;
    startType: 'auto' | 'number' | 'named';
    endType: 'auto' | 'number' | 'named' | 'span';
} => {
    const value = String(input ?? '').trim();
    const empty = { start: '', span: '', end: '', startType: 'auto', endType: 'auto' } as const;
    if (!value) return { ...empty };

    const parts = value.split('/').map((part) => part.trim());
    const left = parts[0] ?? '';
    const right = parts[1] ?? '';

    const classify = (token: string): 'auto' | 'number' | 'named' => {
        if (!token || token === 'auto') return 'auto';
        if (/^-?\d+$/.test(token)) return 'number';
        return 'named';
    }

    // span on right (e.g. "start / span 4" or "column-x / span 4")
    const spanRight = /^span\s*(-?\d+)$/i.exec(right);
    if (spanRight) {
        const spanValue = String(spanRight?.[1] ?? '').trim();
        return {
            start: left || 'auto',
            span: spanValue,
            end: '',
            startType: classify(left),
            endType: 'span',
        };
    }

    // span on the left (rare but spec-valid)
    const spanLeft = /^span\s*(-?\d+)$/i.exec(left);
    if (spanLeft) {
        const spanValue = String(spanLeft?.[1] ?? '').trim();
        return {
            start: 'auto',
            span: spanValue,
            end: '',
            startType: 'auto',
            endType: 'span',
        };
    }

    // named pair: "name-a / name-b"
    const namedPair = /^([A-Za-z_][\w-]*)\s*\/\s*([A-Za-z_][\w-]*)$/.exec(value);
    if (namedPair) {
        const startVal = String(namedPair?.[1] ?? '').trim();
        const endVal = String(namedPair?.[2] ?? '').trim();
        return {
            start: startVal,
            span: '',
            end: endVal,
            startType: 'named',
            endType: 'named',
        };
    }

    // explisit start / end.
    if (parts.length > 1) {
        return {
            start: left || 'auto',
            span: '',
            end: right || 'auto',
            startType: classify(left),
            endType: classify(right),
        };
    }

    // single token
    if (/^span\s+\d+$/i.test(left)) {
        return { start: 'auto', span: left.replace(/^span\s+/i, ''), end: '', startType: 'auto', endType: 'span' };
    }
    return { start: left, span: '', end: '', startType: classify(left), endType: 'auto' };
}

/**
 * Compose a CSS placement string from advanced shorthand.
 */
export function composePlacementAdvanced(
    mode: 'span' | 'end',
    parts: { start?: string | number; end?: string | number; span?: string | number }
): string {
    const start = parts.start ?? 'auto';
    const end = parts.end;
    const span = parts.span;    

    // if the end looks like a named line, honour it directly
    if (typeof end === 'string' && /^[A-Za-z_]/.test(end)) {
        return `${start} / ${end}`;
    }

    if (mode === 'span') {
        // positive-only if start is named (spec)
        let num = Number.isFinite(+span!) ? Math.trunc(+span!) : 1;
        if (typeof start === 'string' && !/^-?\d+$/.test(start) && num < 0) num = Math.abs(num);
        return `${start} / span ${num}`;
    }

    const endVal = (end ?? 'auto');
    return `${start} / ${endVal}`;
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

/**
 * Handle span changes, skipping 0 while allowing positive and negative integers.
 * If the user reaches 0, we nudge them to 1 or -1 depending on direction.
 */
export function handleSpanChangeSkippingZero(
    next: number | undefined,
    lastRef: { current: number },
    cap: number,
    save?: (span: number) => void,
    start?: string | number
): number {
    let span = toInt(next, 1);
    const last = lastRef.current;

    if (!Number.isFinite(span)) span = 1;

    if (span === 0) {
        // Nudge away from zero
        span = last > 0 ? -1 : 1;
    }

    // Prevent invalid negative spans for named lines
    if (typeof start === 'string' && !/^\d+$/.test(start) && span < 0) {
        span = Math.abs(span);
    }

    span = clamp(span, -cap, cap);
    lastRef.current = span;

    if (typeof save === 'function') {
        save(span);
    }

    return span;
}