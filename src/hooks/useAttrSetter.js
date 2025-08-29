import { useCallback } from '@wordpress/element';

export function useAttrSetter(updateAttributes, clientId, { trim = true, emptyUnsets = true } = {}) {
    const normalise = useCallback((value) => {
        let v = value;
        if (trim && typeof v === 'string') v = v.trim();
        if (emptyUnsets && (v === '' || v == null)) return undefined;
        return v;
    }, [trim, emptyUnsets]);

    const set = useCallback((key, value) => {
        updateAttributes(clientId, { [key]: normalise(value) });
    }, [updateAttributes, clientId, normalise]);

    const setMany = useCallback((entries) => {
        const payload = {};
        for (const [k, v] of Object.entries(entries)) {
            payload[k] = normalise(v);
        }
        updateAttributes(clientId, payload);
    }, [updateAttributes, clientId, normalise]);

    const withPrefix = useCallback((prefix) => ({
        set: (suffix, value) => set(`${prefix}${suffix}`, value),
        setMany: (obj) => {
            const namespaced = {};
            for (const [suffix, v] of Object.entries(obj)) {
                namespaced[`${prefix}${suffix}`] = v;
            }
            setMany(namespaced);
        },
    }), [set, setMany]);

    return { set, setMany, withPrefix };
}