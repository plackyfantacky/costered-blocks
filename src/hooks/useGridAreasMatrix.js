import { useState, useEffect, useCallback, useMemo, useRef } from '@wordpress/element';
import { ensureSize, serialiseAreas } from '@utils/gridUtils';

export function useGridAreasMatrix({ seedMatrix, emptyToken = '.', onApply, suspendResync = false }) {
    const [matrix, setMatrix] = useState(() => seedMatrix);
    
    const currentSerialRef = useRef(serialiseAreas(matrix));
    useEffect(() => { currentSerialRef.current = serialiseAreas(matrix); }, [matrix]);

    useEffect(() => {
        if (suspendResync) return;
        const seedSerial = serialiseAreas(seedMatrix);
        if (seedSerial !== currentSerialRef.current) { 
            setMatrix(seedMatrix);
        }
    }, [seedMatrix, suspendResync]);

    const columnData = matrix[0]?.length || 0;
    const rowData = matrix.length || 0;
    
    const setCell = useCallback((x, y, raw) => {
        setMatrix((previous) => {
            const value = String(raw ?? '').trim();
            const nextValue = value === '' ? emptyToken : value;
            const next = previous.map((row, yi) =>
                yi === y
                ? row.map((cell, xi) => (xi === x ? nextValue : cell))
                : row
            );
            onApply?.(next);
            return next;
        });
    }, [onApply, emptyToken]);

    const resize = useCallback((newCols, newRows) => {
        setMatrix((previous) => {
            const next = ensureSize(previous, newCols, newRows, emptyToken);
            onApply?.(next);
            return next;
        });
    }, [emptyToken, onApply]);

    const clear = useCallback((fallbackCols = 1, fallbackRows = 1) => {
        setMatrix(() => {
            const nextMatrix = ensureSize([], Math.max(1, fallbackCols), Math.max(1, fallbackRows), emptyToken);
            onApply?.(nextMatrix);
            return nextMatrix;
        });
    }, [emptyToken, onApply]);

    return { matrix, columnData, rowData, setCell, resize, clear };
}