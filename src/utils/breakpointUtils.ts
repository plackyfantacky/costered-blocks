// src/utils/breakpointUtils.ts

import { ensureShape, isUnsetLike } from '@utils/attributeUtils';
import { normaliseStyleList } from "@utils/costeredStyles";
import type { Breakpoint, BlockAttributes, RawStyle, CSSPrimitive, CascadeOptions } from '@types';

const BP_DESKTOP: Breakpoint = 'desktop';
const EMPTY_ATTRS = Object.freeze({}) as Record<string, unknown>;

export const mapDeviceToBp = (device: unknown): Breakpoint => {
    const dev = String(device ?? '').toLowerCase();
    if (dev.includes('tablet')) return 'tablet';
    if (dev.includes('mobile') || dev.includes('phone')) return 'mobile';
    return 'desktop';
};

/**
 * Internal: read bucket for a breakpoint; always returns an object with desktop/tablet/mobile keys
 */
function readBucket(styles: RawStyle[] | undefined, property: string): CSSPrimitive | undefined {
    const list = normaliseStyleList(styles);
    for (let i = 0; i < list.length; i++) {
        const d = list[i]!;
        if (d.property === property) return d.value;
    }
    return undefined;
};

type ReaderOptions = {
    raw?: boolean;
    breakpoint?: Breakpoint;
    fallback?: CSSPrimitive | undefined;
}; 

/**
 * Factory for a breakpoint-aware reader.
 * Usage:
 *   const readAtBp = makeBreakpointReader('tablet');
 *   const readGridGap = readAtBp('gap')({ costered: ... });
 */
export function makeBreakpointReader(bp: Breakpoint) {
    return (key: string, options: ReaderOptions = {}) => {
        const { raw = false, breakpoint, fallback } = options;
        const useBp: Breakpoint = breakpoint || bp;

        return (attributes: Partial<BlockAttributes> | undefined): CSSPrimitive | undefined => {
            const shaped = ensureShape(attributes?.costered);

            if (raw) {
                const value = readBucket(shaped?.[useBp]?.styles, key);
                return isUnsetLike(value) ? (fallback as CSSPrimitive | undefined) : value;
            }
        
            //cascade: active breakpoint -> desktop
            const primary = readBucket(shaped?.[useBp]?.styles, key);
            if (!isUnsetLike(primary)) return primary;

            const base = readBucket(shaped?.[BP_DESKTOP]?.styles, key);
            return isUnsetLike(base) ? (fallback as CSSPrimitive | undefined) : base;
        };
    }
};

/**
 * Returns a shallow-cloned, non-enumerably augmented attributes object.
 * Idempotent per call. Adds: $get(key, options?), $getMany(keys, options?), $bp.
 * Never mutates the original attrs object.
 */
export function augmentAttributes<Token extends Partial<BlockAttributes>>(
    baseAttrs: Token | undefined,
    bp: Breakpoint
): Token & {
    $get: (key: string, options?: CascadeOptions) => CSSPrimitive | undefined;
    $getCascade: (key: string) => CSSPrimitive | undefined;
    $getMany: (keys: string[], options?: CascadeOptions) => Record<string, CSSPrimitive | undefined>;
    $bp: Breakpoint;
} {
    const source = (baseAttrs as Record<string, unknown>) || EMPTY_ATTRS;
    const clone = { ...(source as object) } as Token;
    const shaped = ensureShape((source as any).costered);

    const orderForm = (active: Breakpoint): Breakpoint[] => {
        switch (active) {
            case 'mobile': return ['mobile', 'tablet', 'desktop'];
            case 'tablet': return ['tablet', 'desktop'];
            default: return ['desktop'];
        }
    }

    // CASCADE by default; opt into raw with { raw: true } or { cascade: false }
    const boundGet = (key: string, options: CascadeOptions = {}): CSSPrimitive | undefined => {
        const cascade = options && Object.prototype.hasOwnProperty.call(options, 'cascade')
            ? !!options.cascade
            : true; //default to true

        const raw = options && Object.prototype.hasOwnProperty.call(options, 'raw')
            ? !!options.raw
            : !cascade; //if cascade is true, raw is false

        const active: Breakpoint = bp || BP_DESKTOP;
        
        if (raw) {
            const value = readBucket(shaped?.[active]?.styles, key);
            return isUnsetLike(value) ? undefined : value;
        }

        //cascade upwards
        const order = orderForm(active);
        for (const bpKey of order) {
            const value = readBucket(shaped?.[bpKey]?.styles, key);
            if (!isUnsetLike(value)) return value;
        }

        return undefined;
    }

    const boundGetCascade = (key: string): CSSPrimitive | undefined => boundGet(key, { cascade: true });

    const boundGetMany = (keys: readonly string[], options?: CascadeOptions) => {
        const output: Record<string, CSSPrimitive | undefined> = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]!;
            output[key] = boundGet(key, options);
        }
        return output;
    };

    Object.defineProperties(clone, {
        $get: { value: boundGet, enumerable: false },
        $getCascade: { value: boundGetCascade, enumerable: false },
        $getMany: { value: boundGetMany, enumerable: false },
        $bp: { value: bp, enumerable: false },
    });

    return clone as Token & {
        $get: (key: string, options?: CascadeOptions) => CSSPrimitive | undefined;
        $getCascade: (key: string) => CSSPrimitive | undefined;
        $getMany: (keys: string[], options?: CascadeOptions) => Record<string, CSSPrimitive | undefined>;
        $bp: Breakpoint;
    };
}