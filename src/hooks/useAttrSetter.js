import { useCallback } from '@wordpress/element';

import { VERBATIM_STRING_KEYS } from "@config";
/**
 * Universal hook to handle setting/clearing attribute values. Supports block-props (inside a block edit) and store data ( sidebar / external UI )
 */
export function useAttrSetter(updateFn, target, { trim = true, emptyUnsets = true } = {}) {
    const isStoreForm = target !== undefined && target !== null;

    const normalise = useCallback((value, key) => {
        if (VERBATIM_STRING_KEYS.has(key)) {
            //verbatim strings; only trim and allow empty to truly unset
            const v = typeof value === 'string' && trim ? value.trim() : String(value);
            return (emptyUnsets && v === '') ? undefined : v;
        }
        //existing behaviour for all other keys
        let v = value;
        if (trim && typeof v === 'string') v = v.trim();
        if (emptyUnsets && (v === '' || v == null)) return undefined;
        return v;
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
    }, [isStoreForm, updateFn, target, normalise])
    
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
    })

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