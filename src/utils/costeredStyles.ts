// src/utils/costeredStyles.ts
import type {
    BlockAttributes,
    Breakpoint,
    CosteredAttributes,
    BreakpointBucket,
    RawStyle,
    StyleDeclaration,
    CSSPrimitive
} from '../../types/costered';

export const BREAKPOINTS: Breakpoint[] = ['desktop', 'tablet', 'mobile'];

function isTuple(x: RawStyle): x is readonly [string, CSSPrimitive] | readonly [string, CSSPrimitive, boolean] {
    return Array.isArray(x);
}

/**
 * Normalise one RawStyle to an object form.
 */
export function normaliseStyle(raw: RawStyle): StyleDeclaration {
    if (isTuple(raw)) {
        const [property, value, important] = raw as readonly [string, CSSPrimitive, boolean?];

        // Only add `important` when defined (works with exactOptionalPropertyTypes)
        return important !== undefined ? { property, value, important } : { property, value };
    }
    return raw;
}

/**
 * Normalise a list (handles undefined safely)
 */
export function normaliseStyleList(list: readonly RawStyle[] | undefined): StyleDeclaration[] {
    if (!Array.isArray(list) || list.length === 0) return [];
    const out: StyleDeclaration[] = [];

    for (let i = 0; i < list.length; i++) out.push(normaliseStyle(list[i]));
    return out;
}

/**
 * Read styles for a breakpoint (normalised)
 */
export function getStylesForBreakpoint(attrs: BlockAttributes | undefined, bp: Breakpoint): StyleDeclaration[] {
    const bucket: BreakpointBucket | undefined =
        (attrs?.costered?.[bp as keyof CosteredAttributes] as unknown as BreakpointBucket | undefined);
    return normaliseStyleList(bucket?.styles);
}

/**
 * Upsert by property; returns RawStyle[] (wire format)
 */
export function upsertStyle(
    list: readonly RawStyle[] | undefined,
    property: string,
    value: CSSPrimitive,
    important?: boolean
): RawStyle[] {
    const src: RawStyle[] = Array.isArray(list) ? list.slice() : [];

    let matchIndex = -1;
    for (let i = 0; i < src.length; i++) {
        const d = normaliseStyle(src[i]!);
        if (d.property === property) {
            matchIndex = i;
            break;
        }
    }

    // Build next decl; only include `important` when explicitly provided
    const nextDecl: RawStyle = important !== undefined ? { property, value, important } : { property, value };

    if (matchIndex === -1) src.push(nextDecl);
    else src[matchIndex] = nextDecl;

    return src;
}

/**
 * Remove a declaration by property (non-mutating).
 */
export function removeStyle(list: readonly RawStyle[] | undefined, property: string): RawStyle[] {
    const src: RawStyle[] = Array.isArray(list) ? Array.from(list) : [];
    const out: RawStyle[] = [];
    for (let i = 0; i < src.length; i++) {
        const d = normaliseStyle(src[i]!);
        if (d.property !== property) out.push(src[i]!);
    }
    return out;
}

/**
 * Shallow merge helper for attrs.costered.{bp}.styles (non-mutating).
 */
export function withBreakpointStyles(
    attrs: BlockAttributes,
    bp: Breakpoint,
    nextStyles: RawStyle[]
): BlockAttributes {
    const current = attrs.costered ?? {};
    const bucket = (current[bp] as BreakpointBucket) ?? { styles: [] };
    const updated: CosteredAttributes = {
        ...current,
        [bp]: { ...bucket, styles: nextStyles },
    };
    return { ...attrs, costered: updated };
}

/**
 * Convert normalised styles to a React style object for editor mirroring.
 */
export function toInlineStyleObject(list: RawStyle[] | undefined): Record<string, CSSPrimitive> {
    const out: Record<string, CSSPrimitive> = {};
    const normalised = normaliseStyleList(list);
    for (let i = 0; i < normalised.length; i++) out[normalised[i]!.property] = normalised[i]!.value;
    return out;
}

