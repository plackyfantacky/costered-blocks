import { useCallback, useMemo } from '@wordpress/element';

//import { useAttrSetter, useParentGridMeta } from '@hooks';
import { useGridStoreAreasIO } from '@hooks';
import { ensureSize, toCount } from '@utils/gridUtils';

type Token = String;
type Matrix = Token[][];

type ColumnInfo = { count: number };
type RowInfo = { count: number };

interface GridStoreAreasIO {
    areasTemplate?: string;
    trackColumnCount?: unknown;
    trackRowCount?: unknown;
    applyMatrixToStore: (matrix: Matrix) => void;
    clearAreasInStore: () => void;
    seedFromStore: (defaultToken?: Token) => Matrix; 
}

export function useGridAreasMatrix(clientId: string) {
    const {
        areasTemplate,
        trackColumnCount,
        trackRowCount,
        applyMatrixToStore,
        clearAreasInStore,
        seedFromStore,
    } = useGridStoreAreasIO(clientId) as GridStoreAreasIO;

    // 1) Seed matrix from store/model; bootstrap from tracks if areas are empty
    const matrix: Matrix = useMemo(() => {
        const seeded = seedFromStore('.');
        //console.log('[areas seed -> shape]', seeded.length, seeded[0]?.length);
        return seeded;
    }, [seedFromStore]);

    // 2) Expose counts (prefer matrix; fall back to track counts)
    const columnData: ColumnInfo = useMemo(
        () => ({ count: matrix?.[0]?.length || toCount(trackColumnCount) }),
        [matrix, trackColumnCount]
    );

    const rowData: RowInfo = useMemo(
        () => ({ count: matrix?.length || toCount(trackRowCount) }),
        [matrix, trackRowCount]
    );

    // 3) Commit helpers
    const commitMatrix = useCallback((next: Matrix) => {
        const cols = next[0]?.length || 0;
        const rows = next.length || 0;

        // trim tokens, collapse empties to '.', and enforce rectangular bounds.
        const cleaned: Matrix = next.map((row) => 
            row.map((token) => (String(token ?? '').trim() || '.') as Token)
        );

        const rectangular = ensureSize(cleaned, cols, rows, '.') as Matrix;
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