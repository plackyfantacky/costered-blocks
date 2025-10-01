import { ensureShape, isUnsetLike } from '@utils/attributeUtils';

const BP_DESKTOP = 'desktop';
const EMPTY_ATTRS = Object.freeze({});

export const mapDeviceToBp = (device) => {
    const dev = String(device || '').toLowerCase();
    if (dev.includes('tablet')) return 'tablet';
    if (dev.includes('mobile') || dev.includes('phone')) return 'mobile';
    return 'desktop';
};

export const makeBreakpointReader = (bp) => (key, options = {}) => {
    const { raw = false, breakpoint, fallback } = options;
    const useBp = breakpoint || bp;

    return (attributes) => {
        const shaped = ensureShape(attributes?.costered);
        if (raw) {
            const value = shaped?.[useBp]?.styles?.[key];
            return isUnsetLike(value) ? fallback : value;
        }

        //cascade: active breakpoint -> desktop
        const primary = shaped?.[useBp]?.styles?.[key];
        if (!isUnsetLike(primary)) return primary;
        const base = shaped?.[BP_DESKTOP]?.styles?.[key];
        return isUnsetLike(base) ? fallback : base;
    };
};

/**
 * Returns a shallow-cloned, non-enumerably augmented attributes object.
 * Idempotent + cached per (baseAttrs, bp).
 * - Adds: $get(key, options?), $getMany(keys, options?), $bp
 * - Never mutates the original attrs object.
 */
export function augmentAttributes(baseAttrs, bp) {
    const source = baseAttrs || EMPTY_ATTRS;

    const clone = { ...source };
    const shaped = ensureShape(source.costered);

    const orderForm = (active) => {
        switch (active) {
            case 'mobile': return ['mobile', 'tablet', 'desktop'];
            case 'tablet': return ['tablet', 'desktop'];
            default: return ['desktop'];
        }
    }

    // CASCADE by default; opt into raw with { raw: true } or { cascade: false }
    const boundGet = (key, options = undefined) => {
        const cascade = (options && Object.prototype.hasOwnProperty.call(options, 'cascade'))
            ? !!options.cascade
            : true; //default to true

        const raw = (options && Object.prototype.hasOwnProperty.call(options, 'raw')
            ? !!options.raw
            : !cascade); //if cascade is true, raw is false
        
        const active = bp || BP_DESKTOP;
        if (raw) {
            const value = shaped?.[active]?.styles?.[key];
            return isUnsetLike(value) ? undefined : value;
        }

        //cascade upwards
        const order = orderForm(active);
        for (const bpKey of order) {
            const value = shaped?.[bpKey]?.styles?.[key];
            if (!isUnsetLike(value)) return value;
        }

        return undefined;
    }

    const boundGetCascade = (key) => boundGet(key, { cascade: true });

    const boundGetMany = (keys, options) => {
        const output = {};
        for (const key of keys) output[key] = boundGet(key, options);
        return output;
    };

    Object.defineProperties(clone, {
        $get: { value: boundGet, enumerable: false },
        $getCascade: { value: boundGetCascade, enumerable: false },
        $getMany: { value: boundGetMany, enumerable: false },
        $bp: { value: bp, enumerable: false },
    });

    return clone;
}