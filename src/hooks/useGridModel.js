import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';
import { decodeAxis, measureAreas } from "@utils/gridUtils";

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
        
        const areasTemplate = attrs.gridTemplateAreas ?? null;
        const areasMeta = measureAreas(areasTemplate);

        return {
            columns: cols,
            rows: rows,
            areas: {
                template: areasTemplate,
                ...areasMeta
            },
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