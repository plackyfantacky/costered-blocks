/**
 * Universal hook to handle setting/clearing attribute values. Supports block-props (inside a block edit) and store data ( sidebar / external UI )
 */
import { useCallback } from '@wordpress/element';

import { VERBATIM_STRING_KEYS } from "@config";

export function useAttrSetter(updateFn, target, { trim = true, emptyUnsets = true } = {}) {
    const isStoreForm = target !== undefined && target !== null;

    const normalise = useCallback((rawValue, key) => {
        if (rawValue === undefined || rawValue === null) return undefined; //exit early
        if (VERBATIM_STRING_KEYS.has(key)) {
            //verbatim strings; only trim and allow empty to truly unset
            const v = typeof rawValue === 'string' && trim ? rawValue.trim() : String(rawValue);
            return (emptyUnsets && v === '') ? undefined : v;
        }
        //existing behaviour for all other keys
        let value = rawValue;
        if (trim && typeof value === 'string') value = value.trim();
        if (emptyUnsets && (value === '' || value == null)) return undefined;

        //guard against 'undefined' and 'null' strings
        const outputValue = String(value).trim();
        if (!outputValue || outputValue === 'undefined' || outputValue === 'null') return undefined;
        return outputValue;
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