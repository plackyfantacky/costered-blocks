import { useMemo, useCallback } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

import { useAttrSetter, useGridModel } from '@hooks';
import { countTracks, parseAreas, serialiseAreas, ensureSize } from '@utils/gridUtils';

export function useGridStoreAreasIO(clientId) {
    const { updateBlockAttributes } = useDispatch(blockEditorStore);
    const { set, unset } = useAttrSetter(updateBlockAttributes, clientId);
    
    const model = useGridModel(clientId);
    const columnTemplate = model?.columns?.template ?? null;
    const rowTemplate = model?.rows?.template ?? null;
    const areasTemplate = model?.areas?.template ?? null;

    const trackColumnCount = useMemo(
        () => (columnTemplate ? countTracks(columnTemplate) : 0),
        [columnTemplate]
    );

    const trackRowCount = useMemo(
        () => (rowTemplate ? countTracks(rowTemplate) : 0),
        [rowTemplate]
    );

    const applyMatrixToStore = useCallback((matrix) => {
        const template = serialiseAreas(matrix, '.');
        if (template) {
            set('gridTemplateAreas', template);
        } else {
            unset('gridTemplateAreas');
        }
    }, [set, unset]);

    const clearAreasInStore = useCallback(() => {
        unset('gridTemplateAreas');
    }, [unset]);

    const seedFromStore = useCallback((emptyToken = '.') => {
        const parsed = parseAreas(areasTemplate, emptyToken);;
        const columns = parsed[0]?.length || trackColumnCount || 1;
        const rows = parsed.length || trackRowCount || 1;
        return ensureSize(parsed, columns, rows, emptyToken);
    }, [areasTemplate, trackColumnCount, trackRowCount]);

    return {
        areasTemplate,
        trackColumnCount,
        trackRowCount,
        applyMatrixToStore,
        clearAreasInStore,
        seedFromStore,
    };
}