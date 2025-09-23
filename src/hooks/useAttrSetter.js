/**
 * Universal hook to handle setting/clearing attribute values. Supports block-props (inside a block edit) and store data ( sidebar / external UI )
 */
import { useCallback } from '@wordpress/element';

import { VERBATIM_STRING_KEYS, UNITLESS } from "@config";

export function useAttrSetter(updateFn, target, { trim = true, emptyUnsets = true } = {}) {
    const isStoreForm = target !== undefined && target !== null;

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
            if(typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) {
                const num = Number(value);
                return Number.isFinite(num) ? num : undefined;
            }
            if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
            //anything else is invalid
            return undefined;
        }

        //final coercion. numbers become numbers, everything else becomes string
        if(typeof value === 'number') return Number.isFinite(value) ? value : undefined;

        if(typeof value === 'string') {
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

    const apply = useCallback((partial) => {
        if(isStoreForm) {
            return updateFn(target, partial)
        } else {
            const next = {};
            for (const [key, value] of Object.entries(partial)) {
                const nextValue = normalise(value, key);
                if (nextValue === undefined) continue;
                next[key] = nextValue;
            }
            if (Object.keys(next).length) updateFn(target, next);
        }
    }, [isStoreForm, updateFn, target, normalise]);
    
    const set = useCallback((key, value) => {
        apply({ [key]: normalise(value, key) });
    }, [apply, normalise]);

    const setMany = useCallback((entries) => {
        const payload = {};
        for (const [key, value] of Object.entries(entries)) {
            payload[key] = normalise(value, key);
        }
        apply(payload);
    }, [apply, normalise]);

    const unset = useCallback((key) => {
        apply({ [key]: undefined });
    });

    const unsetMany = useCallback((keys) => {
        const payload = {};
        for (const key of keys) {
            payload[key] = undefined;
        }
        apply(payload);
    }, [apply]);

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

    return { set, setMany, unset, unsetMany, withPrefix };
}