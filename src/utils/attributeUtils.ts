// src/utils/attributeUtils.ts
import type { CosteredAttributes, Breakpoint, CSSPrimitive, StyleMap, BreakpointBucket } from "@types";

/**
 * Ensure attrs.costered exists with desktop/tablet/mobile buckets and
 * a canonical styles map (plain object).
 */
export const ensureShape = (costered?: Partial<CosteredAttributes> | undefined): CosteredAttributes => {
    const makeBucket = (maybe: Partial<BreakpointBucket> | undefined) : BreakpointBucket => {
        const styles = maybe?.styles;
        if (styles && typeof styles === 'object' && !Array.isArray(styles)) {
            //clone to avoid mutations
            return { ...maybe, styles: { ...(styles as StyleMap) } } as BreakpointBucket;
        }
        return { ...maybe || {}, styles: {} as StyleMap } as BreakpointBucket;
    };
    
    const input = (costered && typeof costered === 'object') ? costered : {};
    

    const hasNamedBuckets =
        !!input.desktop || !!input.tablet || !!input.mobile;

    return {
        desktop: makeBucket(input.desktop),
        tablet: makeBucket(input.tablet),
        mobile: makeBucket(input.mobile),
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