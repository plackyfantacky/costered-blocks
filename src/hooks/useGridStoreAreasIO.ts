import { useMemo, useCallback } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

import { useAttrSetter, useGridModel } from '@hooks';
import { countTracks, parseAreas, serialiseAreas, ensureSize, toCount } from '@utils/gridUtils';

type Token = string;
type Matrix = Token[][];

type TrackInfo = { count?: unknown} | number;

interface GridModel {
    columns?: { template?: string | null; count?: unknown };
    rows?: { template?: string | null; count?: unknown };
    areas?: { template?: string | null };
}


export function useGridStoreAreasIO(clientId: string) {
    const { set, unset } = useAttrSetter(clientId);

    const childCount = useSelect((select: any) => {
        const block = select(blockEditorStore)?.getBlock?.(clientId);
        return block?.innerBlocks?.length || 0;
    }, [clientId]) as number;

    const model = useGridModel(clientId) as GridModel | undefined;
    const columnTemplate: string = model?.columns?.template ?? '';
    const rowTemplate: string = model?.rows?.template ?? '';
    const areasTemplate: string = model?.areas?.template ?? '';

    // COLS: prefer explicit template; else infer from children & known rows; else 0
    const trackColumnCount = useMemo(() => {
        // 1) explicit template
        if (columnTemplate) {
            const info: TrackInfo = countTracks(columnTemplate);
            const num = toCount((info as any)?.count ?? info);
            if (num > 0) return num;
        }

        // 2) If rows are known (from model or template), infer columns from children
        const rowsHint =
            toCount(model?.rows?.count) ||
            (() => {
                if (!rowTemplate) return 0;
                const info: TrackInfo = countTracks(rowTemplate);
                return toCount((info as any)?.count ?? info);
            })();

        if (rowsHint > 0 && childCount > 0) {
            return Math.ceil(childCount / rowsHint);
        }

        // 3) unknown
        return 0;
    }, [columnTemplate]);

    // ROWS: prefer explicit model count; else explicit template; else infer from children & known cols; else 0
    const trackRowCount = useMemo(() => {
        // 1) model count
        const modelHint = toCount(model?.rows?.count);
        if (modelHint > 0) return modelHint;

        // 2) explicit template
        if (rowTemplate) {
            const info: TrackInfo = countTracks(rowTemplate);
            const num = toCount((info as any)?.count ?? info);
            if (num > 0) return num;
        }

        // 3) If columns from cols and known rows
        const cols = toCount(trackColumnCount);
        if (cols > 0 && childCount > 0) {
            return Math.ceil(childCount / cols);
        }

        // 4) unknown
        return 0;
    }, [rowTemplate, model?.rows?.count, trackColumnCount, childCount]);

    const applyMatrixToStore = useCallback((matrix: Matrix) => {
        const template = serialiseAreas(matrix, '.');
        // console.log('[areas write]', template);

        if (template) {
            set('gridTemplateAreas', template);
        } else {
            unset('gridTemplateAreas');
        }
    }, [set, unset]);

    const clearAreasInStore = useCallback(() => {
        unset('gridTemplateAreas');
    }, [unset]);

    const seedFromStore = useCallback((emptyToken: Token = '.') => {
        // 1) parse areas
        const parsed = parseAreas(areasTemplate, emptyToken) as Matrix;

        // 2) Figure out intended dimensions
        let cols = toCount(parsed[0]?.length) || toCount(trackColumnCount);
        let rows = toCount(parsed.length) || toCount(trackRowCount);

        if (cols === 0 && rows > 0 && childCount > 0) {
            cols = Math.ceil(childCount / rows);
        } else if (rows === 0 && cols > 0 && childCount > 0) {
            rows = Math.ceil(childCount / cols);
        }

        if (cols === 0) cols = 1;
        if (rows === 0) rows = 1;

        const seeded = ensureSize(
            parsed.map((row) => row.map((token) => (String(token || emptyToken)))),
            cols,
            rows,
            emptyToken
        ) as Matrix;
        
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