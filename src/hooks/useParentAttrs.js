import { useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

import { selectActiveBreakpoint } from '@stores/activeBreakpoint.js';
import { augmentAttributes } from '@utils/breakpointUtils.js';
import { MIRRORED_STYLE_KEYS } from '@config';

export function useParentAttrs(passedClientId, options = {}) {
    const keys = options.keys ?? Array.from(MIRRORED_STYLE_KEYS);

    // Find the parent block
    const { parentId, parentBlock } = useSelect((select) => {
        const blockEditor = select('core/block-editor');
        const selectedId = passedClientId || blockEditor.getSelectedBlockClientId();
        
        if (!selectedId) return { parentId: null, parentBlock: null };
        const parentId = blockEditor.getBlockRootClientId(selectedId);
        if (!parentId) return { parentId: null, parentBlock: null };
        
        return { parentId, parentBlock: blockEditor.getBlock(parentId) || null };
    }, []);

    const activeBreakpoint = useSelect(selectActiveBreakpoint, []);

    const parentAugmented = useMemo(() => {
        const attributes = parentBlock?.attributes;
        return attributes ? augmentAttributes(attributes, activeBreakpoint) : null;
    }, [parentBlock?.attributes, activeBreakpoint]);

    const parentAttrs = useMemo(() => {
        if (!parentBlock) return null;
        const output = {};
        for (const key of keys) output[key] = parentAugmented?.$get(key);
        return output;
    }, [parentBlock, parentAugmented, keys]);

    return { parentId, parentAttrs, parentBlock, parentAugmented };
}