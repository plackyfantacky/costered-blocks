import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';

import { selectActiveBreakpoint } from '@stores/activeBreakpoint.js';
import { augmentAttributes } from '@utils/breakpointUtils.js';
import { countTracks } from "@utils/gridUtils";

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

    const columnsTemplate = parent?.$get('gridTemplateColumns', { cascade: true });
    const rowsTemplate = parent?.$get('gridTemplateRows', { cascade: true });

    const { count: columnCount } = useMemo(() => countTracks(columnsTemplate), [columnsTemplate]);
    const { count: rowCount } = useMemo(() => countTracks(rowsTemplate), [rowsTemplate]);

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
        columns: columnsTemplate,
        rows: rowsTemplate,
        areas: parent?.$get('gridTemplateAreas', { cascade: true }),
        columnCount,
        rowCount
    }
}