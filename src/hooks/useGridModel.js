import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';
import { decodeAxis, decodeAreas } from "@utils/gridPanelUtils";

export function useGridModel(clientId) {
    const attrs = useSelect((select) => {
        if(!clientId) return {};
        const be = select(blockEditorStore);
        const block = be.getBlock(clientId);
        return block?.attributes ?? {};
    }, [clientId]);

    const model = useMemo(() => {
        const cols = decodeAxis(attrs.gridTemplateColumns);
        const rows = decodeAxis(attrs.gridTemplateRows);
        const areas = decodeAreas(attrs.gridTemplateAreas);
        return {
            columns: cols,
            rows: rows,
            areas: areas,
            activePane: {
                columns: cols.mode,
                rows: rows.mode
            }
        }
    },[
        attrs.gridTemplateColumns,
        attrs.gridTemplateRows,
        attrs.gridTemplateAreas
    ])

    return model;
} 