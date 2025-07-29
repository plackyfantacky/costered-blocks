import { COSTERED_LAYOUT_SCHEMA } from "@lib/style-schema";
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

export function useUnsetBlockAttributes(clientId) {
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    return (keys) => {
        const update = Object.fromEntries(keys.map(key => [key, undefined]));
        updateBlockAttributes(clientId, update);
    };
}

export function useCleanBlockAttributes(clientId) {
    const block = useBlockByClientId(clientId);
    const { updateBlock } = useDispatch('core/block-editor');

    const unsetAttributes = (keys) => {
        if (!clientId || !block) return;

        const cleanedAttrs = { ...block.attributes };

        keys.forEach((key) => {
            if (key in cleanedAttrs) {
                delete cleanedAttrs[key];
            }
        });

        updateBlock(clientId, {
            ...block,
            attributes: cleanedAttrs,
        });
    };

    return unsetAttributes;
}