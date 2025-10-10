// src/utils/costeredStyles.ts

import type {
    BlockAttributes,
    Breakpoint,
    CosteredAttributes,
    BreakpointBucket,
    StyleMap,
} from '@types';

export interface CosteredStyles {
    desktop?: StyleMap;
    tablet?: StyleMap;
    mobile?: StyleMap;
}

type StylesSource =
    | BlockAttributes
    | { costered?: CosteredAttributes }
    | CosteredAttributes
    | { costered?: { styles?: CosteredStyles }}
    | CosteredStyles
    | undefined;

/** Narrow helper that won't misclassify falsy values like 0. */
function hasOwn(obj: unknown, key: string): boolean {
    return !!obj && Object.prototype.hasOwnProperty.call(obj as object, key);
}

function resolveStyles(source: StylesSource): CosteredStyles | undefined {
    if (!source) return undefined;

    // A) Canonical bucketed on full attrs or on { costered?: CosteredAttributes }
    const maybeCostered = (source as any)?.costered as CosteredAttributes | undefined;
    if (maybeCostered && typeof maybeCostered === 'object') {
        //try bucketed first
        const maybeCompact = (maybeCostered as any)?.styles as CosteredStyles | undefined;
        if (maybeCompact && typeof maybeCompact === 'object') {
            return maybeCompact;
        }
        // No compact object here; fall through — bucketed will be read per-bp in getStylesForBreakpoint.
    }
    
    // B) If the value itself looks like a bucketed object (CosteredAttributes), allow legacy compact under .styles
    if ((source as any).styles && typeof (source as any).styles === 'object') {
        return (source as any).styles as CosteredStyles;
    }

    // C) Legacy compact shape: attrs.costered.styles.desktop/tablet/mobile
    // or plain CosteredStyles passed directly
    // (This is the only case that returns a non-undefined value.)
    if (
        typeof source === 'object' &&
        (('desktop' in (source as any)) ||
        ('tablet' in (source as any)) ||
        ('mobile' in (source as any)))
    ) {
        return source as CosteredStyles;
    }

    // D) Nothing found
    return undefined;
    
}


/**
 * READ-ONLY: return the StyleMap for a breakpoint.
 * Supports BOTH shapes:
 *  - Bucketed (canonical): attrs.costered[bp].styles
 *  - Legacy compact: attrs.costered.styles.desktop/tablet/mobile  OR plain CosteredStyles
 *
 * Never returns undefined; returns an EMPTY MAP for missing buckets.
 * DO NOT mutate the returned object. For writes, use ensureStylesForBreakpoint().
 */
export function getStylesForBreakpoint(
    source: StylesSource,
    bp: Breakpoint
): StyleMap {
    //1 Canonical bucketed shape
    const costered = (source as any)?.costered as CosteredAttributes | undefined;
    if (costered && typeof costered === 'object') {
        const bucket = costered[bp] as BreakpointBucket | undefined;
        if (bucket?.styles && typeof bucket.styles === 'object' && !Array.isArray(bucket.styles)) {
            return bucket.styles as StyleMap;
        }
        // if bucket missing, keep looking for legacy compact before returning empty
    }

    //2 Legacy compact: attrs.costered.styles.desktop/tablet/mobile
    const compact = resolveStyles(source);
    if (compact) {
        const map =
            bp === 'mobile' ? compact.mobile :
            bp === 'tablet' ? compact.tablet :
            compact.desktop;
        return (map ?? ({} as StyleMap));
    }

    //3 Nothing found
    return {} as StyleMap;
}


/**
 * WRITE-SAFE: ensure the styles object and the requested breakpoint bucket exist.
 * Mutates the passed `source` *in place* and returns the mutable StyleMap for that bucket.
 */
export function ensureStylesForBreakpoint(
    source: BlockAttributes | CosteredStyles,
    bp: Breakpoint
): StyleMap {
    // Prefer the canonical bucketed shape on write
    if ((source as BlockAttributes)?.costered !== undefined) {
        const attrs = source as BlockAttributes;
        const costered = (attrs.costered ??= {} as CosteredAttributes);  // ensure costered container. ??= is shorthand for "if undefined" apparently. TIL.
        const bucket = (costered[bp] ??= { styles: {} as StyleMap }) as BreakpointBucket; // ensure bucket
        return (bucket.styles ??= {} as StyleMap); // ensure styles map
    }
    let styles: CosteredStyles | undefined =
        (source as any)?.costered?.styles ??
        (('desktop' in (source as any) || 'tablet' in (source as any) || 'mobile' in (source as any))
            ? (source as CosteredStyles)
            : undefined);

    if (!styles) {
        styles = {};
        // attach to attrs.costered.styles if this is BlockAttributes-like
        if ((source as any)?.costered) {
            (source as any).costered.styles = styles;
        } else if ((source as any)?.costered === undefined && (source as any)) {
            // ensure costered container if missing
            (source as any).costered = { styles };
        } else {
            // else: treat as bare CosteredStyles
            Object.assign(source as any, styles);
        }
    }

    //2 Find/attach bucket for bp
    let bucket: StyleMap | undefined;
    if (bp === 'mobile') {
        bucket = styles.mobile ??= {};
    } else if (bp === 'tablet') {
        bucket = styles.tablet ??= {};
    } else {
        bucket = styles.desktop ??= {};
    }
    return bucket;
}

/**
 * Read an explicit value at a breakpoint without cascading.
 * Checks presence, not truthiness, so 0 (e.g. gap/zIndex) is preserved.
 */
export function getStyleValueExplicit(
    source: StylesSource,
    key: string,
    bp: Breakpoint
): unknown {
    const map = getStylesForBreakpoint(source, bp);
    return hasOwn(map, key) ? (map as Record<string, unknown>)[key] : undefined;
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