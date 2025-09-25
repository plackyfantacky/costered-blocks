import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';

import { selectActiveBreakpoint } from '@stores/activeBreakpoint.js';
import { decodeAxis, measureAreas } from "@utils/gridUtils";
import { augmentAttributes } from '@utils/breakpointUtils';

export function useGridModel(clientId) {

    const rawAttributes = useSelect((select) => {
        if (!clientId) return {};
        const blockEditor = select(blockEditorStore);
        const block = blockEditor.getBlock(clientId);
        return block?.attributes ?? {};
    }, [clientId]);

    const activeBreakpoint = useSelect(selectActiveBreakpoint, []);
    
    const attributes = useMemo(
        () => augmentAttributes(rawAttributes, activeBreakpoint),
        [rawAttributes, activeBreakpoint]
    );
    const read = (key, options = {}) => attributes.$get(key, options);

    const model = useMemo(() => {
        const gridTemplateColumns = read('gridTemplateColumns');
        const gridTemplateRows = read('gridTemplateRows');
        const gridTemplateAreas = read('gridTemplateAreas');

        const cols = decodeAxis(gridTemplateColumns);
        const rows = decodeAxis(gridTemplateRows);

        const {template: areasTemplate, ...areasMeta} = measureAreas(
            gridTemplateAreas,
            cols.count,
            rows.count
        );
        return {
            columns: cols,
            rows: rows,
            areas: { template: areasTemplate, ...areasMeta},
            activePane: { columns: cols.mode, rows: rows.mode }
        }
    }, [ activeBreakpoint, attributes?.costered, attributes?.$get ]);

    return model;
} 