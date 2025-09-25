/**
 * Universal hook to handle setting/clearing attribute values. Supports block-props (inside a block edit) and store data ( sidebar / external UI )
 */
import { useCallback, useMemo } from '@wordpress/element';
import { useDispatch, useSelect, select as dataSelect } from '@wordpress/data';

import { ensureShape, deleteOrSet } from '@utils/attributeUtils.js';
import { seedCosteredId } from '@utils/blockUtils.js';
import { VERBATIM_STRING_KEYS, UNITLESS } from "@config";
import { selectActiveBreakpoint } from '@stores/activeBreakpoint.js';

const BP_DESKTOP = 'desktop';

export function useAttrSetter(arg1, arg2, options = { trim: true, emptyUnsets: true, breakpoint: undefined }) {
    const { trim = true, emptyUnsets = true, breakpoint: forcedBreakpoint } = options;

    const selectedBreakpoint = useSelect(selectActiveBreakpoint, []);
    const activeBreakpoint = forcedBreakpoint || selectedBreakpoint || BP_DESKTOP;

    const { updateBlockAttributes } = useDispatch('core/block-editor');
    
    const updateFn = useMemo(() => {
        // called as useAttrSetter(clientId)
        if (typeof arg1 === 'string' && !arg2) {
            const clientId = arg1;
            return (updaterOrObject) => {
                if (!clientId) return;
                if (typeof updaterOrObject === 'function') {
                    const prev = dataSelect('core/block-editor').getBlockAttributes(clientId) || {};
                    const next = updaterOrObject(prev) || prev;
                    updateBlockAttributes(clientId, next);
                } else {
                    updateBlockAttributes(clientId, updaterOrObject || {});
                }
            }
        }

        // called as useAttrSetter(updateBlockAttributes, clientId)
        if (typeof arg1 === 'function' && typeof arg2 === 'string') {
            const writer = arg1;
            const clientId = arg2;
            return (updaterOrObject) => {
                if (!clientId) return;
                if (typeof updaterOrObject === 'function') {
                    const prev = dataSelect('core/block-editor').getBlockAttributes(clientId) || {};
                    const next = updaterOrObject(prev) || prev;
                    try {
                        writer(clientId, next);
                    } catch {
                        // if a compat writer was passed accidentally, just call it
                        writer(next);
                    }
                } else {
                    try {
                        writer(clientId, updaterOrObject || {});
                    } catch {
                        writer(updaterOrObject || {});
                    }
                }
            }
        }

        // already a compat function writer
        if (typeof arg1 === 'function') return arg1;

        // fallback - no-op
        return () => {};
    }, [arg1, arg2, updateBlockAttributes]);

    const normalise = useCallback((rawValue, key) => {
        //exit early
        if (rawValue === undefined || rawValue === null) return undefined;

        //verbatim strings; only trim and allow empty to truly unset
        if (VERBATIM_STRING_KEYS.has(key)) {
            const value = (typeof rawValue === 'string' && trim) ? rawValue.trim() : String(rawValue);
            return (emptyUnsets && value === '') ? undefined : value;
        }

        let value = rawValue;

        //trim only if it's a string
        if (trim && typeof value === 'string') value = value.trim();

        //collapse empty strings to undefined
        if (emptyUnsets && (
            value === '' ||
            value == 'null' ||
            value == 'undefined'
        )) return undefined;

        // for unitless numbers, coerce to number
        if (UNITLESS.has(key)) {
            if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) {
                const num = Number(value);
                return Number.isFinite(num) ? num : undefined;
            }
            if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
            //anything else is invalid
            return undefined;
        }

        //final coercion. numbers become numbers, everything else becomes string
        if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;

        if (typeof value === 'string') {
            if (value === 'null' || value === 'undefined') return undefined;
            return value;
        }

        // fallback - try to stringify
        try {
            return String(value);
        } catch {
            return undefined;
        }
    }, [trim, emptyUnsets]);

    const set = useCallback((key, input) => {
        updateFn((prev) => {
            const next = { ...(prev || {}) };
            seedCosteredId(next); // ensure a stable costeredId
            next.costered = ensureShape(next.costered);
            
            const bucket = { ...next.costered[activeBreakpoint].styles };
        
            const value = normalise(input, key); //only run once
            deleteOrSet(bucket, key, value);

            next.costered[activeBreakpoint] = {
                ...next.costered[activeBreakpoint],
                styles: bucket
            };
            return next;
        });
    }, [updateFn, activeBreakpoint, normalise]);

    const setMany = useCallback((partial) => {
        if (!partial || typeof partial !== 'object') return;

        updateFn((prev) => {
            const next = { ...(prev || {}) };
            seedCosteredId(next); // ensure a stable costeredId
            next.costered = ensureShape(next.costered);

            const bucket = { ...next.costered[activeBreakpoint].styles };

            for (const [key, input] of Object.entries(partial)) {
                const value = normalise(input, key); //only run once per key
                deleteOrSet(bucket, key, value);
            }

            next.costered[activeBreakpoint] = {
                ...next.costered[activeBreakpoint],
                styles: bucket
            };
            return next;
        });

    }, [updateFn, activeBreakpoint, normalise]);

    const unset = useCallback((key) => {
        updateFn((prev) => {
            const next = { ...(prev || {}) };
            seedCosteredId(next); // ensure a stable costeredId - we always want a costeredId even if all styles are cleared
            next.costered = ensureShape(next.costered);

            const bucket = { ...next.costered[activeBreakpoint].styles };
            if (!(key in bucket)) return prev; //no change
            delete bucket[key];

            next.costered[activeBreakpoint] = {
                ...next.costered[activeBreakpoint],
                styles: bucket
            };
            return next;
        });
    }, [updateFn, activeBreakpoint]);

    const unsetMany = useCallback((keys) => {
        if (!Array.isArray(keys) || keys.length === 0) return;

        updateFn((prev) => {
            const next = { ...(prev || {}) };
            seedCosteredId(next); // ensure a stable costeredId - we always want a costeredId even if all styles are cleared
            next.costered = ensureShape(next.costered);

            const bucket = { ...next.costered[activeBreakpoint].styles };
            let changed = false;
            for (const key of keys) {
                if (key in bucket) {
                    delete bucket[key];
                    changed = true;
                }
            }
            if (!changed) return prev; //no change

            next.costered[activeBreakpoint] = {
                ...next.costered[activeBreakpoint],
                styles: bucket
            };
            return next;
        });
    }, [updateFn, activeBreakpoint]);

    const withPrefix = useCallback((prefix) => ({
        set: (key, value) => set(`${prefix}${key}`, value),
        setMany: (obj) => {
            const namespaced = {};
            for (const [key, v] of Object.entries(obj)) {
                namespaced[`${prefix}${key}`] = v;
            }
            setMany(namespaced);
        },
        unset: (key) => unset(`${prefix}${key}`),
        unsetMany: (keys) => unsetMany(keys.map((s) => `${prefix}${s}`)),
    }), [set, setMany, unset, unsetMany]);

    return { set, setMany, unset, unsetMany, withPrefix, activeBreakpoint };
}