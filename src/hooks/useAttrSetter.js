import { useCallback } from '@wordpress/element';

/**
 * Universal hook to handle setting/clearing attribute values. Supports block-props (inside a block edit) and store data ( sidebar / external UI )
 */
export function useAttrSetter(updateFn, target, { trim = true, emptyUnsets = true } = {}) {
    const isStoreForm = target !== undefined && target !== null;

    const normalise = useCallback((value) => {
        let v = value;
        if (trim && typeof v === 'string') v = v.trim();
        if (emptyUnsets && (v === '' || v == null)) return undefined;
        return v;
    }, [trim, emptyUnsets]);

    const apply = useCallback((partial) => {
        if(isStoreForm) {
            return updateFn(target, partial)
        }
        return updateFn(partial)
    }, [isStoreForm, updateFn, target])
    
    const set = useCallback((key, value) => {
        apply({ [key]: normalise(value) });
    }, [apply, normalise]);

    const setMany = useCallback((entries) => {
        const payload = {};
        for (const [key, value] of Object.entries(entries)) {
            payload[key] = normalise(value);
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