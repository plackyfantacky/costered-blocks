import { COSTERED_LAYOUT_SCHEMA } from "@lib/schema";
import { addFilter } from '@wordpress/hooks';
import { useDispatch, useSelect } from '@wordpress/data';

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