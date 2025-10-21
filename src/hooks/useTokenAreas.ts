// src/hooks/useTokenAreas.ts
// Single-source hook for editing `grid-template-areas` via a matrix.
// Keeps the existing UI unchanged: setCell(col, row, token), resize({cols,rows}), clear().

import { useCallback, useMemo, useEffect } from '@wordpress/element';
import { useAttrGetter, useAttrSetter, useGridModel } from '@hooks'; // your existing hook barrel
import {
    parseAreasToMatrix,
    composeMatrixToAreas,
    ensureSize,
    createEmptyMatrix,
} from '@utils/tokenAreaAdapter';
import { countTracks, toCount } from "@utils/gridUtils";

import type { Matrix, ColumnInfo, RowInfo, CSSPrimitive } from '@types';

const EMPTY = '.';

export function useTokenAreas(clientId: string) {
    const { get } = useAttrGetter(clientId);
    const { set, unset } = useAttrSetter(clientId);
    const model = useGridModel(clientId);

    // raw attribute
    const areasRaw = get('gridTemplateAreas');

    // derived track counts from model
    const colTracksInfo = countTracks(model?.columns?.template ?? '');
    const rowTracksInfo = countTracks(model?.rows?.template ?? '');

    const trackCols = toCount((colTracksInfo as any)?.count ?? colTracksInfo);
    const trackRows = toCount((rowTracksInfo as any)?.count ?? rowTracksInfo);

    // parse -> matrix (always at least 1x1)
    const matrix = useMemo<Matrix>(() => {
        const parsed = parseAreasToMatrix(areasRaw, EMPTY);
        const cols = parsed[0]?.length ?? 0;
        const rows = parsed.length ?? 0;

        const shouldSeedFromTracks =
            (!cols || !rows) ||
            (trackCols > cols) || 
            (trackRows > rows);

        if (shouldSeedFromTracks) {
            return createEmptyMatrix(Math.max(trackCols, 1), Math.max(trackRows, 1), EMPTY);
        }
        
        return parsed;
    }, [areasRaw, trackCols, trackRows]);

    useEffect(() => {
        const currentCssValue = String(get('gridTemplateAreas') ?? '').trim();

        const isPlaceholder =
            !currentCssValue ||
            currentCssValue === '""' ||
            currentCssValue === '"' + EMPTY + '"' ||
            currentCssValue === `"${EMPTY}"` ||
            currentCssValue === EMPTY ||
            /(^"?"?\."?"?$)/.test(currentCssValue);

        if (isPlaceholder && (trackCols > 1 || trackRows > 1)) {
            const seeded = createEmptyMatrix(trackCols || 1, trackRows || 1, EMPTY);
            const css = composeMatrixToAreas(seeded, EMPTY);
            set('gridTemplateAreas', css);
        }
    },[get, set, trackCols, trackRows]);

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
    const resize = useCallback((cols: number, rows: number) => {
        const next = ensureSize(matrix, rows, cols, EMPTY); //ignore the reversed column/row order. you didn't see anything.
        write(next);
    }, [matrix, write]);

    // API — clear to EMPTY
    const clear = useCallback(() => {
        write(matrix.map((r) => r.map(() => EMPTY)));
    }, [matrix, write]);

    // API - reset matrix to match track counts
    const resetToTrackCount = useCallback(() => {
        const cols = Math.max(1, trackCols);
        const rows = Math.max(1, trackRows);
        const next = ensureSize(matrix, rows, cols, EMPTY); //ignore the reversed column/row order. you didn't see anything.
        write(next);
    }, [matrix, trackCols, trackRows, write]);


    const columnTemplate = model?.columns?.template;
    const rowTemplate = model?.rows?.template;

    return {
        matrix,
        columnData,
        rowData,
        setCell,
        resize,
        clear,
        resetToTrackCount,
        trackCols,
        trackRows,
        columnTemplate,
        rowTemplate
    };
}
