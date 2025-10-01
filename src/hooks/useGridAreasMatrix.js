import { useCallback, useMemo } from '@wordpress/element';

//import { useAttrSetter, useParentGridMeta } from '@hooks';
import { useGridStoreAreasIO } from '@hooks';
import { ensureSize, toCount } from '@utils/gridUtils';

import { log } from '@debug';

export function useGridAreasMatrix(clientId) {
    const {
        areasTemplate,
        trackColumnCount,
        trackRowCount,
        applyMatrixToStore,
        clearAreasInStore,
        seedFromStore,
    } = useGridStoreAreasIO(clientId);

    // 1) Seed matrix from store/model; bootstrap from tracks if areas are empty
    const matrix = useMemo(() => {
        const m = seedFromStore('.');
        console.log('[areas seed -> shape]', m.length, m[0]?.length);
        return m;
    }, [seedFromStore]);

    // 2) Expose counts (prefer matrix; fall back to track counts)
    const columnData = useMemo(() => ({ count: matrix?.[0]?.length || toCount(trackColumnCount) }), [matrix, trackColumnCount]);
    const rowData = useMemo(() => ({ count: matrix?.length || toCount(trackRowCount) }), [matrix, trackRowCount]);

    // 3) Commit helpers
    const commitMatrix = useCallback((next) => {
        const cols = next[0]?.length || 0;
        const rows = next.length || 0;
        const rectangular = ensureSize(
            next.map(row => row.map(token => (String(token ?? '').trim() || '.'))),
            cols, rows,
            '.'
        );
        applyMatrixToStore(rectangular);
    }, [applyMatrixToStore]);

    const dimensions = useMemo(() => {
        const rows = matrix?.length || 0;
        const cols = rows ? (matrix[0]?.length || 0) : 0;
        return { rows, cols };
    }, [matrix]);

    const inBounds = useCallback((col, row) => col >= 0 && col < dimensions.cols && row >= 0 && row < dimensions.rows, [dimensions]);

    const setCell = useCallback((x, y, name) => {
        if (!Array.isArray(matrix) || matrix.length === 0) return;
        const col = Math.trunc(toCount(x)) || 0;
        const row = Math.trunc(toCount(y)) || 0;
        if (!inBounds(col, row)) return;

        const token = String(name ?? '').trim() || '.';
        const next = matrix.map((row) => row.slice());
        
        next[row][col] = token;
        commitMatrix(next);

    }, [matrix, commitMatrix, inBounds]);

    const resize = useCallback(({ rows, cols }) => {
        const targetRows = toCount(rows);
        const targetCols = toCount(cols);
        if (!(targetRows > 0 && targetCols > 0)) return;
        const next = ensureSize(matrix, targetCols, targetRows, '.');
        commitMatrix(next);
    }, [matrix, commitMatrix]);

    const clear = useCallback(() => clearAreasInStore(), [clearAreasInStore]);

    //console.log('[TokenGrid] matrix shape', { cols: matrix[0]?.length || 0, rows: matrix.length });

    return { matrix, columnData, rowData, setCell, resize, clear };
}