// src/utils/attributeUtils.ts
import type { CosteredAttributes, Breakpoint, RawStyle, StyleDeclaration, CSSPrimitive } from "@types";

/**
 * Normalise an unknown "styles" value into RawStyle[].
 * - Accepts an array of StyleDeclaration-like items
 * - Accepts a plain object map { property: value }
 * - Everything else becomes an empty array
 */
const normaliseStyles = (styles: unknown): RawStyle[] => {
    if (Array.isArray(styles)) {
        return (styles as Array<Partial<StyleDeclaration>>)
            .filter(Boolean)
            .map((item) => {
                const property = String((item as any).property ?? '');
                const value = (item as any).value as CSSPrimitive | undefined;
                return property && value !== undefined ? { property, value } : undefined;
            })
            .filter(Boolean) as RawStyle[];       
    }
    if (styles && typeof styles === 'object') {
        const out: StyleDeclaration[] = [];
        for (const [property, value] of Object.entries(
            styles as Record<string, CSSPrimitive | undefined>)
        ) {
            if (value !== undefined) out.push({ property, value });
        }
        return out;
    }
    return [];
};


/**
 * Build a bucket object from anything, defaulting to { styles: [] }.
 * Accepts either { styles } or a raw styles value directly.
 */
const asBucket = (maybeBucket: unknown) => {
    if (maybeBucket && typeof maybeBucket === 'object' && 'styles' in (maybeBucket as any)) {
        return  { styles: normaliseStyles((maybeBucket as any).styles) };
    }
    return { styles: normaliseStyles(maybeBucket) };
}




/**
 * Ensure attrs.costered exists with desktop/tablet/mobile buckets and array-based styles.
 * Converts legacy object maps ({ prop: value }) to RawStyle[].
 */
export const ensureShape = (costered?: unknown): CosteredAttributes => {
    const input = (costered as Partial<CosteredAttributes>) || {};

    const hasNamedBuckets =
        !!input.desktop || !!input.tablet || !!input.mobile;

    if(!hasNamedBuckets) {
        return {
            desktop: asBucket(input),
            tablet: asBucket(undefined),
            mobile: asBucket(undefined)
        }
    }

    return {
        desktop: asBucket(input.desktop),
        tablet: asBucket(input.tablet),
        mobile: asBucket(input.mobile),
    };
};

/**
 * Set or delete a key on a plain object map (used by legacy/object-shaped callers).
 * Empty-ish values delete, otherwise set.
 */
export const deleteOrSet = (obj: Record<string, unknown>, key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') {
        if (Object.prototype.hasOwnProperty.call(obj, key)) delete obj[key];
    } else {
        obj[key] = value;
    }
};

/** True for values that should be treated as "unset". */
export const isUnsetLike = (value: unknown): boolean => 
    value === undefined ||
    value === null ||
    value === '' ||
    value === 'null' ||
    value === 'undefined';