import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';
import { useParentAttrs, useGridModel } from '@hooks';

import { countTracks, parseAreas, ensureSize } from '@utils/gridUtils';
import { selectActiveBreakpoint } from '@stores/activeBreakpoint.js';
import { augmentAttributes } from '@utils/breakpointUtils.js';

export function useParentGridMeta(passedClientId) {
    const { parentId, parentBlock } = useSelect((select) => {
        const blockEditor = select('core/block-editor');
        
        const selectedId = passedClientId || blockEditor.getSelectedBlockClientId();
        if (!selectedId) return { parentId: null, parentBlock: null };

        const parentId = blockEditor.getBlockRootClientId(selectedId);
        if (!parentId) return { parentId: null, parentBlock: null };
        return { parentId, parentBlock: blockEditor.getBlock(parentId) || null };
    }, [passedClientId]);

    const breakpoint = useSelect(selectActiveBreakpoint, []);
    
    const parent = useMemo(
        () => parentBlock?.attributes ? augmentAttributes(parentBlock.attributes, breakpoint) : null, 
        [parentBlock?.attributes, breakpoint]
    );

    const isGrid = useMemo(() => {
        const display = parent?.$get?.('display', { cascade: true }) ?? '';
        return /^(grid|inline-grid)$/i.test(String(display).trim());
    }, [parent, parent?.$bp]);

    return {
        parentId,
        parentBlock,
        parent,
        isGrid,
        display: parent?.$get('display', { cascade: true }),
        cols: parent?.$get('gridTemplateColumns', { cascade: true }),
        rows: parent?.$get('gridTemplateRows', { cascade: true }),
        areas: parent?.$get('gridTemplateAreas', { cascade: true }),
    }
}