import { useCallback, useMemo } from '@wordpress/element';

import { useGridStoreAreasIO } from '@hooks';
import { ensureSize, toCount } from '@utils/gridUtils';
import type { Token, Matrix } from '@types';

type ColumnInfo = { count: number };
type RowInfo = { count: number };

export function useGridAreasMatrix(clientId: string) {
    const {
        areasTemplate, //unused / parity
        trackColumnCount,
        trackRowCount,
        applyMatrixToStore,
        clearAreasInStore,
        seedFromStore,
    } = useGridStoreAreasIO(clientId);

    // 1) Seed matrix from store/model; bootstrap from tracks if areas are empty
    const matrix = useMemo<Matrix>(() => seedFromStore('.'), [seedFromStore]);

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
    const commitMatrix = useCallback(
        (next: Matrix) => {
            const cols = next[0]?.length || 0;
            const rows = next.length || 0;

            // trim tokens, collapse empties to '.', and enforce rectangular bounds.
            const cleaned: Matrix = next.map((row) => 
                row.map((token) => {
                    const value = String(token ?? '').trim();
                    return value === '' ? '.' : value;
                })
            );
            
            const rectangular = ensureSize(cleaned, cols, rows, '.'); // string[][]
            applyMatrixToStore(rectangular);
        },
        [applyMatrixToStore]
    );

    const dimensions = useMemo(() => {
        const rows = matrix?.length || 0;
        const cols = rows ? (matrix[0]?.length || 0) : 0;
        return { rows, cols };
    }, [matrix]);

    const inBounds = useCallback(
        (col: number, row: number) => 
            col >= 0 && col < dimensions.cols && row >= 0 && row < dimensions.rows,
        [dimensions]
    );

    const setCell = useCallback(
        (x: unknown, y: unknown, name: unknown) => {

            const base: Matrix = matrix;
            if(base.length === 0) return; // nothing to set into
                
            const col = Math.trunc(toCount(x)) || 0;
            const row = Math.trunc(toCount(y)) || 0;
            if (!inBounds(col, row)) return;

            const token: Token = String(name ?? '').trim() || '.';
            const next: Matrix = base.map((r) => r.slice() as Token[]);
            next[row]![col] = token;

            commitMatrix(next);
        },
        [matrix, commitMatrix, inBounds]
    );


    const resize = useCallback(
        ({ rows, cols }: { rows: unknown; cols: unknown }) => { 
            const targetRows = toCount(rows);
            const targetCols = toCount(cols);
            if (!(targetRows > 0 && targetCols > 0)) return;
            
            const next = ensureSize(matrix, targetCols, targetRows, '.'); // string[][]
            commitMatrix(next);
    }, [matrix, commitMatrix]);

    const clear = useCallback(() => clearAreasInStore(), [clearAreasInStore]);

    //console.log('[TokenGrid] matrix shape', { cols: matrix[0]?.length || 0, rows: matrix.length });

    return { matrix, columnData, rowData, setCell, resize, clear };
}