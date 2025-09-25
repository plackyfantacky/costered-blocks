import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useMemo, useCallback } from '@wordpress/element';

import { REDUX_STORE_KEY as BP_STORE } from '@config';
import { augmentAttributes } from '@utils/breakpointUtils';

export function useAttrGetter(clientId) {
    const bp = useSelect((select) => select(BP_STORE)?.getBreakpoint?.() || 'desktop', []);

    const rawAttributes = useSelect((select) => {
        if (!clientId) return null;
        const blockEditor = select(blockEditorStore);
        return blockEditor.getBlockAttributes(clientId); 
    }, [clientId]);

    const attributes = useMemo(
        () => (rawAttributes ? augmentAttributes(rawAttributes, bp) : undefined),
        [rawAttributes, bp]
    );

    const get = useCallback((key, options) => {
        if (!attributes?.$get) return {};
        return attributes.$get(key, options);
    }, [attributes]);

    const getMany = useCallback((keys, options) => {
        if (!attributes?.$get) return {};
        const result = {};
        keys.forEach((key) => {
            result[key] = attributes.$get(key, options);
        });
        return result;
    }, [attributes]);

    return { get, getMany, bp, attributes }
}