import { useSelect } from '@wordpress/data';

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