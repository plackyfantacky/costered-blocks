// src/utils/costeredStyles.ts

import type {
    BlockAttributes,
    Breakpoint,
    CosteredAttributes,
    BreakpointBucket,
    StyleMap,
} from '@types';

export const BREAKPOINTS: Breakpoint[] = ['desktop', 'tablet', 'mobile'];



/**
 * Read styles for a breakpoint. Always returns a plain object (never undefined).
 */
export function getStylesForBreakpoint(
    attrs: BlockAttributes | undefined,
    bp: Breakpoint
): StyleMap {
    const bucket = attrs?.costered?.[bp as keyof CosteredAttributes] as BreakpointBucket | undefined;
    const styles = bucket?.styles as unknown;
    if(styles && typeof styles === 'object' && !Array.isArray(styles)) {
        return { ...(styles as StyleMap) };
    }
    return {};
}

/**
 * Read a single property. Returns undefined if missing or empty.
 */
export function getStyleValue(
    attrs: BlockAttributes | undefined,
    bp: Breakpoint,
    property: string
): string | undefined {
    const map = getStylesForBreakpoint(attrs, bp);
    const raw = map[property];
    const value = typeof raw === 'string' ? raw.trim() : '';
    return value !== '' ? value : undefined;
}

/**
 * Set/unset a single property and return a new attributes object (non-mutating).
 * - Passing `undefined` deletes the property.
 * - Values are stored as trimmed strings.
 */
export function setStyleValue(
    attrs: BlockAttributes,
    bp: Breakpoint,
    property: string,
    value: string | undefined
): BlockAttributes {
    const currentCostered = attrs.costered ?? {};
    const currentBucket = (currentCostered[bp] as BreakpointBucket) ?? { styles: {} as StyleMap };
    const map = getStylesForBreakpoint(attrs, bp);

    if (value == null || String(value).trim() === '') {
        if (Object.prototype.hasOwnProperty.call(map, property)) {
            // delete then maybe collapse to empty object
            const { [property]: _removed, ...rest } = map;
            const nextBucket: BreakpointBucket = { ...currentBucket, styles: rest };
            const nextCostered: CosteredAttributes = { ...currentCostered, [bp]: nextBucket };
            return { ...attrs, costered: nextCostered };
        }
        return attrs; // nothing to remove
    }

    const nextMap: StyleMap = { ...map, [property]: String(value).trim() };
    const nextBucket: BreakpointBucket = { ...currentBucket, styles: nextMap };
    const nextCostered: CosteredAttributes = { ...currentCostered, [bp]: nextBucket };
    return { ...attrs, costered: nextCostered };
}

/**
 * Replace the entire styles object for a breakpoint with a canonical map.
 * Expects a plain object; refuses arrays/other shapes.
 */
export function withBreakpointStyles(
    attrs: BlockAttributes,
    bp: Breakpoint,
    nextStyles: StyleMap
): BlockAttributes {
    if (!nextStyles || typeof nextStyles !== 'object' || Array.isArray(nextStyles)) {
        throw new Error('withBreakpointStyles expects a plain object of camelCase CSS properties → string values.');
    }
    const currentCostered = attrs.costered ?? {};
    const currentBucket = (currentCostered[bp] as BreakpointBucket) ?? { styles: {} as StyleMap };
    const nextBucket: BreakpointBucket = { ...currentBucket, styles: { ...nextStyles } };
    const nextCostered: CosteredAttributes = { ...currentCostered, [bp]: nextBucket };
    return { ...attrs, costered: nextCostered };
}

/**
 * Convert normalised styles to a React style object for editor mirroring.
 */
export function toInlineStyleObject(styles: StyleMap | undefined): Record<string, string> {
    if (!styles) return {};
    if (typeof styles !== 'object' || Array.isArray(styles)) return {};
    const out: Record<string, string> = {};
    const keys = Object.keys(styles);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]!;
        const value = styles[key];
        if (value != undefined && value !== null) out[key] = String(value);
    }
    return out;
}

/**
 * Development guardrail: refuse to persist non-canonical shapes.
 * Call this in the lowest-level writer before updateBlockAttributes().
 */
export function assertCanonicalCostered(attrs: BlockAttributes | undefined): void {
    const c = attrs?.costered;
    if (!c || typeof c !== 'object') return;
    for (const bp of Object.keys(c)) {
        const styles = (c as any)[bp]?.styles;
        const isCanonical = styles && typeof styles === 'object' && !Array.isArray(styles);
        if (!isCanonical) {
            // eslint-disable-next-line no-console
            console.error('[Costered] Non-canonical styles detected in', bp, styles);
            throw new Error('Costered must persist styles as a plain object of camelCase CSS properties → string values.');
        }
    }
}