import { useMemo, useCallback } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

import { useAttrSetter, useGridModel } from '@hooks';
import { countTracks, parseAreas, serialiseAreas, ensureSize, toCount } from '@utils/gridUtils';

export function useGridStoreAreasIO(clientId) {
    const { set, unset } = useAttrSetter(clientId);

    const childCount = useSelect((select) => {
        const block = select(blockEditorStore).getBlock(clientId);
        return block?.innerBlocks?.length || 0;
    }, [clientId]);

    const model = useGridModel(clientId);
    const columnTemplate = model?.columns?.template ?? null;
    const rowTemplate = model?.rows?.template ?? null;
    const areasTemplate = model?.areas?.template ?? null;

    // COLS: prefer explicit template; else infer from children & known rows; else 0
    const trackColumnCount = useMemo(() => {
        if (columnTemplate) {
            const info = countTracks(columnTemplate);
            const num = toCount(info?.count ?? info);
            if (num > 0) return num;
        }

        // If rows are known (from model or template), infer columns from children
        const rowsHint =
            toCount(model?.rows?.count) ||
            (() => {
                if (!rowTemplate) return 0;
                const info = countTracks(rowTemplate);
                return toCount(info?.count ?? info);
            })();

        if (rowsHint > 0 && childCount > 0) {
            return Math.ceil(childCount / rowsHint);
        }

        return 0;
    }, [columnTemplate]);

    // ROWS: prefer explicit model count; else explicit template; else infer from children & known cols; else 0
    const trackRowCount = useMemo(() => {
        const modelHint = toCount(model?.rows?.count);
        if (modelHint > 0) return modelHint;

        if (rowTemplate) {
            const info = countTracks(rowTemplate);
            const num = toCount(info?.count ?? info);
            if (num > 0) return num;
        }

        const cols = toCount(trackColumnCount);
        if (cols > 0 && childCount > 0) {
            return Math.ceil(childCount / cols);
        }

        return 0;
    }, [rowTemplate, model?.rows?.count]);

    const applyMatrixToStore = useCallback((matrix) => {
        const template = serialiseAreas(matrix, '.');
        console.log('[areas write]', template);
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
        const parsed = parseAreas(areasTemplate, emptyToken);

        // Figure out intended dimensions in this order:
        // 1) parsed areas width/height
        // 2) explicit track counts (after inference from children)
        // 3) last-resort 1
        let cols = toCount(parsed[0]?.length) || toCount(trackColumnCount);
        let rows = toCount(parsed.length) || toCount(trackRowCount);

        if (cols === 0 && rows > 0 && childCount > 0) {
            cols = Math.ceil(childCount / rows);
        } else if (rows === 0 && cols > 0 && childCount > 0) {
            rows = Math.ceil(childCount / cols);
        }

        if (cols === 0) cols = 1;
        if (rows === 0) rows = 1;

        const seeded = ensureSize(parsed, cols, rows, emptyToken);


        //console.log('[GridStoreIO seed]', { cols, rows, seededCols: seeded[0]?.length || 0, seededRows: seeded.length });

        return seeded;
    }, [areasTemplate, trackColumnCount, trackRowCount, childCount]);

    return {
        areasTemplate,
        trackColumnCount,
        trackRowCount,
        applyMatrixToStore,
        clearAreasInStore,
        seedFromStore,
    };
}