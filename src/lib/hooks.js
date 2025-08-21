import { COSTERED_LAYOUT_SCHEMA } from "@lib/schema";
import { addFilter } from '@wordpress/hooks';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';

addFilter('blocks.registerBlockType', 'costered-blocks/setup-data-schema', (settings) => ({
    ...settings,
    attributes: {
        ...settings.attributes,
        ...COSTERED_LAYOUT_SCHEMA
    }
}));

export function useSelectedBlockInfo() {
    return useSelect((select) => {
        const editor = select('core/block-editor');
        const clientId = editor.getSelectedBlockClientId();
        const block = clientId ? editor.getBlock(clientId) : null;
        return { selectedBlock: block, clientId };
    }, []);
}

export function useBlockByClientId(clientId) {
    return useSelect(
        (select) => select('core/block-editor').getBlock(clientId),
        [clientId]
    );
}

/**
 * @deprecated Use `useAttrsSetter(updateAttributes, clientId)` instead.
 */
export const useSetOrUnsetAttrs = (key, attributes, updateAttributes, clientId) => (value) => {
    updateAttributes(clientId, {
        ...attributes,
        [key]: (value === '' || value == null) ? undefined : value
    });
}

export function useUnsetBlockAttributes(clientId) {
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    return (keys) => {
        const update = Object.fromEntries(keys.map(key => [key, undefined]));
        updateBlockAttributes(clientId, update);
    };
}

export function useParentAttrs() {
    return useSelect((select) => {
        const be = select('core/block-editor');
        const selectedId = be.getSelectedBlockClientId();
        if (!selectedId) return { parentId: null, parentAttrs: null, parentBlock: null };

        const parentId = be.getBlockRootClientId(selectedId);
        if (!parentId) return { parentId: null, parentAttrs: null, parentBlock: null };

        const parentBlock = be.getBlock(parentId) || null;
        const parentAttrs = parentBlock?.attributes ?? null;

        return { parentId, parentAttrs, parentBlock };
    }, []);
}

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

export function useAttrBinding(attributes, updateAttributes, clientId) {
    const { set } = useAttrSetter(updateAttributes, clientId);

    return (key) => {
        const value = attributes?.[key] ?? '';
        const onChange = useCallback((next) => set(key, next), [set, key]);
        return { value, onChange };
    }
}