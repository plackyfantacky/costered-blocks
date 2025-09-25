import { useCallback, useMemo } from '@wordpress/element';
//import { ensureSize, serialiseAreas } from '@utils/gridUtils';
import { useAttrSetter, useParentGridMeta } from '@hooks';

/** Parse a CSS grid-template-areas string into a 2D matrix of tokens ('.' or names) */
const parseGridTemplateAreas  = (areasString) => {
    if (!areasString || typeof areasString !== 'string') return [];
    const rowStrings = areasString
        .split(/"\s*"\s*|'\s*'\s*|[\r\n]+/)
        .map((line) => line.replace(/['"]/g, '').trim())
        .filter(Boolean);
    if (!rowStrings.length) return [];
    return rowStrings.map((line) => line.split(/\s+/));
};

// Serialise a 2D matrix of tokens back into grid-template-areas
const serialiseGridTemplateAreas = (matrix) => {
    if (!Array.isArray(matrix) || !matrix.length) return '';
    return matrix.map((row) => `"${row.join(' ')}"`).join('\n');
};

export function useGridAreasMatrix(clientId) {
    const meta = useParentGridMeta(clientId);
    const parentId = meta?.parentId ?? null;
    const parentBlock = meta?.parentBlock ?? null;

    const augmentedOrAttrs = 
        (meta && meta.parentAugmented) ||
        (meta && meta.parentAttrs) ||
        null;
        
    const { set } = useAttrSetter(parentId);

    const areasString = useMemo(() => {
        let value;
        if (augmentedOrAttrs && typeof augmentedOrAttrs.$get === 'function') {
            value = augmentedOrAttrs.$get('gridTemplateAreas', { cascade: true });
            if (typeof value === 'string' && value.trim()) return value;
        }
        return value;
    }, [
        // re-run when bp changes if augmented is present
        augmentedOrAttrs && augmentedOrAttrs.$bp,
        parentBlock && parentBlock.attributes && parentBlock.attributes.gridTemplateAreas
    ]);

    const isGrid = useMemo(() => {
        // prefer a computed flag from meta if present
        if (meta && typeof meta.isGrid === 'boolean') return meta.isGrid;

        // otherwise derive from attrs we have (cascaded if possible)
        let display;
        if (augmentedOrAttrs && typeof augmentedOrAttrs.$get === 'function') {
            display = augmentedOrAttrs.$get('display', { cascade: true }) || '';
        } else {
            display = parentBlock && parentBlock.attributes && parentBlock.attributes.display;
        }
    }, [meta && meta.isGrid, augmentedOrAttrs && augmentedOrAttrs.$bp, parentBlock && parentBlock.attributes && parentBlock.attributes.display]);

    const matrix = useMemo(() => (isGrid ? parseGridTemplateAreas(areasString) : []), [isGrid, areasString]);

    const columnData = useMemo(() => {
        const columnCount = matrix.length ? matrix[0].length : 0
        return { count: columnCount };
    }, [matrix]);

    const rowData = useMemo(() => {
        const rowCount = matrix.length;
        return { count: rowCount };
    }, [matrix]);

    const commitMatrix = useCallback((nextMatrix) => {
        if (!Array.isArray(nextMatrix) || !nextMatrix.length) {
            // Clear areas if matrix is empty
            set('gridTemplateAreas', '');
            return;
        }

        const maxColumns = Math.max(0, ...nextMatrix.map((row) => (Array.isArray(row) ? row.length : 0)));

        const rectangular = nextMatrix.map((row) => {
            const currentRow = Array.isArray(row) ? row.slice(0, maxColumns) : [];
            while (currentRow.length < maxColumns) currentRow.push('.');
            return currentRow.map((token) => (token && String(token).trim()) || '.');
        });

        set('gridTemplateAreas', serialiseGridTemplateAreas(rectangular));
    }, [set]);
    
    const setCell = useCallback((rowIndex, colIndex, name) => {
        if (!Array.isArray(matrix) || !matrix.length) return;
        const nextMatrix = matrix.map((row) => row.slice());
        const currentRow = nextMatrix[rowIndex];
        if (!currentRow) return;
        currentRow[colIndex] = (name && String(name).trim()) || '.';
        commitMatrix(nextMatrix);
    }, [matrix, commitMatrix]);

    const resize = useCallback(({ rows, cols }) => {
        const targetRows = Math.max(0, Number(rows) || 0);
        const targetCols = Math.max(0, Number(cols) || 0);

        const currentRows = matrix.length;
        const currentCols = matrix.length ? matrix[0].length : 0;

        const nextMatrix = Array.from({ length: targetRows }).map((_, rowIndex) => {
            const sourceRow = rowIndex < currentRows ? matrix[rowIndex] : [];
            const newRow = Array.from({ length: targetCols }).map((_, colIndex) => {
                if (rowIndex < currentRows && colIndex < currentCols) {
                    return sourceRow[colIndex] || '.';
                }
                return '.';
            });
            return newRow;
        });

        commitMatrix(nextMatrix);
    }, [matrix, commitMatrix]);
    
    const clear = useCallback(() => set('gridTemplateAreas', ''), [set]);

    return { matrix, columnData, rowData, setCell, resize, clear };
}