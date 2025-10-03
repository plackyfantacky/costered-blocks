// src/utils/attributeUtils.ts
import type { CosteredAttributes, Breakpoint, RawStyle, StyleDeclaration, CSSPrimitive } from "@types";

/**
 * Ensure attrs.costered exists with desktop/tablet/mobile buckets and array-based styles.
 * Converts legacy object maps ({ prop: value }) to RawStyle[].
 */
export const ensureShape = (costered?: unknown): CosteredAttributes => {
    const input = (costered as Partial<CosteredAttributes>) || {};

    const normaliseStyles = (styles: unknown): RawStyle[] => {
        if (Array.isArray(styles)) return styles as RawStyle[];
        if (styles && typeof styles === 'object') {
            const out: StyleDeclaration[] = [];
            for (const [property, value] of Object.entries(styles as Record<string, CSSPrimitive | undefined>)) {
                if (value !== undefined) out.push({ property, value });
            }
            return out;
        }
        return [];
    };

    const safe: CosteredAttributes = {
        desktop: { styles: [] },
        tablet: { styles: [] },
        mobile: { styles: [] },
        ...input
    };

    safe.desktop = { styles: normaliseStyles((input.desktop as any).styles), ...(input.desktop || {}) };
    safe.tablet = { styles: normaliseStyles((input.tablet as any).styles), ...(input.tablet || {}) };
    safe.mobile = { styles: normaliseStyles((input.mobile as any).styles), ...(input.mobile || {}) };
    
    return safe;
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
    value === undefined || value === null || value === '' || value === 'null' || value === 'undefined';