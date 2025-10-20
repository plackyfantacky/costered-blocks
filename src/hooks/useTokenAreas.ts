// src/hooks/useTokenAreas.ts
// Single-source hook for editing `grid-template-areas` via a matrix.
// Keeps the existing UI unchanged: setCell(col, row, token), resize({cols,rows}), clear().

import { useCallback, useMemo } from '@wordpress/element';
import { useAttrGetter, useAttrSetter } from '@hooks'; // your existing hook barrel
import {
    parseAreasToMatrix,
    composeMatrixToAreas,
    ensureSize,
    createEmptyMatrix,
} from '@utils/tokenAreaAdapter';

import type { Matrix, ColumnInfo, RowInfo } from '@types';

type ResizeArgs = { cols: number; rows: number };

const EMPTY = '.';

export function useTokenAreas(clientId: string) {
    const { get } = useAttrGetter(clientId);
    const { set, unset } = useAttrSetter(clientId);

    // raw attribute
    const areasRaw = get('gridTemplateAreas');

    // parse -> matrix (always at least 1x1)
    const matrix = useMemo<Matrix>(() => {
        const parsed = parseAreasToMatrix(areasRaw, EMPTY);
        const cols = parsed[0]?.length ?? 0;
        const rows = parsed.length ?? 0;
        return cols && rows ? parsed : createEmptyMatrix(1, 1, EMPTY);
    }, [areasRaw]);

    // derived counts the UI can use (numbers)
    const columnData: ColumnInfo = matrix[0]?.length ?? 0;
    const rowData: RowInfo = matrix.length;

    // write matrix -> attribute (compose + set/unset)
    const write = useCallback((next: Matrix) => {
        const css = composeMatrixToAreas(next, EMPTY);
        if (css && css !== '""') {
            set('gridTemplateAreas', css);
        } else {
            unset('gridTemplateAreas');
        }
    }, [set, unset]);

    // API — set a single cell (col, row, token)
    const setCell = useCallback((col: number, row: number, token: string) => {
        const safe = (token ?? '').trim() || EMPTY;
        const next = matrix.map((r, ry) =>
            r.map((c, cx) => (cx === col && ry === row ? safe : c))
        );
        write(next);
    }, [matrix, write]);

    // API — resize whole matrix (preserve, then fill with EMPTY)
    const resize = useCallback(({ cols, rows }: ResizeArgs) => {
        const next = ensureSize(matrix, cols, rows, EMPTY);
        write(next);
    }, [matrix, write]);

    // API — clear to EMPTY
    const clear = useCallback(() => {
        write(matrix.map((r) => r.map(() => EMPTY)));
    }, [matrix, write]);

    return {
        matrix,
        columnData,
        rowData,
        setCell, // (col, row, token)
        resize, // ({ cols, rows })
        clear,
    };
}
