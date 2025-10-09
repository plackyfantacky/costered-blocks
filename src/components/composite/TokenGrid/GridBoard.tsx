import { useState, useEffect, useCallback, useRef } from '@wordpress/element';
import { Button } from '@wordpress/components';

import { toCount } from '@utils/gridUtils';
import Token from '@components/composite/Token';

import type { Matrix, ColumnInfo, RowInfo } from '@types';

type Labels = Partial<{
    addColumn: string;
    removeColumn: string;
    addRow: string;
    removeRow: string;
    tokenExpand: string;
    tokenCollapse: string;
    tokenRemove: string;
    tokenMoveLeft: string;
    tokenMoveRight: string;
}>;

type Props = {
    matrix: Matrix;
    columnData: ColumnInfo;
    rowData: RowInfo;
    setCell: (col: number, row: number, token: string) => void;
    resize: (cols: number, rows: number) => void;
    clear: () => void;
    emptyToken?: string;
    labels?: Labels;
    onEditingChange?: (isEditing: boolean) => void;
}

type TokenLabelKey = 'expand' | 'collapse' | 'remove' | 'moveLeft' | 'moveRight';

function definedTokenLabels(src: {
    tokenExpand?: string;
    tokenCollapse?: string;
    tokenRemove?: string;
    tokenMoveLeft?: string;
    tokenMoveRight?: string;
}): Partial<Record<TokenLabelKey, string>> {
    const out: Partial<Record<TokenLabelKey, string>> = {};
    if (src.tokenExpand !== undefined) out.expand = src.tokenExpand;
    if (src.tokenCollapse !== undefined) out.collapse = src.tokenCollapse;
    if (src.tokenRemove !== undefined) out.remove = src.tokenRemove;
    if (src.tokenMoveLeft !== undefined) out.moveLeft = src.tokenMoveLeft;
    if (src.tokenMoveRight !== undefined) out.moveRight = src.tokenMoveRight;
    return out;
}


export function GridBoard({
    matrix,
    columnData,
    rowData,
    setCell,
    resize,
    clear,
    emptyToken = '.',
    labels = {},
    onEditingChange
    
}: Props) {
    const rowsArray: string[][] = Array.isArray(matrix) ? matrix : [];

    const colsFromAreas = rowsArray[0]?.length ?? 0;
    const rowsFromAreas = rowsArray.length;

    const cols = toCount((columnData as any)?.count ?? columnData) || colsFromAreas;
    const rows = toCount((rowData as any)?.count ?? rowData) || rowsFromAreas;

    const safeCols = Math.max(1, cols);
    const safeRows = Math.max(1, rows);

    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const gridRef = useRef<HTMLDivElement | null>(null);

    const indexFromXY = useCallback((x: number, y: number): number => (y * safeCols) + x, [safeCols]);

    const xyFromIndex = useCallback((index: number): [number, number] => {
        const columnIndex = index % safeCols;
        const rowIndex = Math.floor(index / safeCols);
        return [columnIndex, rowIndex];
    }, [safeCols]);

    useEffect(() => {
        onEditingChange?.(expandedIndex != null);
    }, [expandedIndex, onEditingChange]);

    useEffect(() => {
        setExpandedIndex((current) => {
            if (current == null) return current;
            const [x, y] = xyFromIndex(current);
            const inBounds = x < safeCols && y < safeRows;
            return inBounds ? current : null;
        });
    }, [safeCols, safeRows, xyFromIndex]);

    const handleToggle = useCallback((index: number, openMaybe?: boolean) => {
        const shouldOpen = typeof openMaybe === 'boolean' ? openMaybe : (expandedIndex !== index);
        setExpandedIndex(shouldOpen ? index : null);
    }, [expandedIndex]);

    const moveLeftFromIndex = useCallback((index: number) => {
        const [x, y] = xyFromIndex(index);
        if (x <= 0) return;
        setExpandedIndex(indexFromXY(x - 1, y));
    }, [xyFromIndex, indexFromXY]);

    const moveRightFromIndex = useCallback((index: number) => {
        const [x, y] = xyFromIndex(index);
        if (x >= safeCols - 1) return;
        setExpandedIndex(indexFromXY(x + 1, y));
    }, [xyFromIndex, indexFromXY, safeCols]);

    // Column/row controls
    const addColumn = useCallback(() => resize(cols + 1, rows), [resize, cols, rows]);
    const removeColumn = useCallback(() => resize(Math.max(1, cols - 1), rows), [resize, cols, rows]);
    const addRow = useCallback(() => resize(cols, rows + 1), [resize, cols, rows]);
    const removeRow = useCallback(() => resize(cols, Math.max(1, rows - 1)), [resize, cols, rows]);

    const popoverWidth = gridRef.current?.offsetWidth;

    return (
        <div className="costered-blocks--token-grid--area" ref={gridRef}>
            {/* header row: column controls */}
            <div className="costered-blocks--token-grid--row costered-blocks--token-grid--row-head">
                <div className="costered-blocks--token-grid--cell costered-blocks--token-grid--cell-corner" /> { /* corner cell. usually empty */}
                {Array.from({ length: safeCols }).map((_, x) => (
                    <div className="costered-blocks--token-grid--cell costered-blocks--token-grid--cell-head" key={`col-${x}`}>
                        <div
                            key={`header-col-${x}`}
                            className="costered-blocks--token-grid--controls"
                        >
                            <Button
                                onClick={removeColumn}
                                disabled={cols <= 1}
                                variant="tertiary"
                                icon="minus"
                                label={labels.removeColumn}
                            />
                            <Button
                                onClick={addColumn}
                                variant="tertiary"
                                icon="plus"
                                label={labels.addColumn}
                            />
                        </div>
                    </div>
                ))}
            </div>
            {/* body */}
            {rowsArray.map((row, y) => (
                <div key={`row-${y}`} className="costered-blocks--token-grid--row">
                    {/* row controls (left gutter) */}
                    <div className="costered-blocks--token-grid--cell costered-blocks--token-grid--cell-head">
                        <div className="costered-blocks--token-grid--controls">
                            <Button
                                onClick={removeRow}
                                disabled={rows <= 1}
                                variant="tertiary"
                                icon="minus"
                                label={labels.removeRow}
                            />
                            <Button
                                onClick={addRow}
                                variant="tertiary"
                                icon="plus"
                                label={labels.addRow}
                            />
                        </div>
                    </div>

                    {row.map((cellValue, x) => {
                        const index = indexFromXY(x, y);
                        const inputValue = (cellValue === emptyToken) ? '' : cellValue;
                        return (
                            <div key={`cell-${x}-${y}`} className="costered-blocks--token-grid--cell">
                                <Token
                                    index={index}
                                    value={inputValue}
                                    isExpanded={expandedIndex === index}
                                    onToggle={handleToggle}
                                    onRemove={(remove_index) => {
                                        const [cellX, cellY] = xyFromIndex(remove_index);
                                        setCell(cellX, cellY, emptyToken);
                                        setExpandedIndex(null);
                                    }}
                                    onChange={(change_index, next) => { 
                                        const [cellX, cellY] = xyFromIndex(change_index);
                                        setCell(cellX, cellY, next);
                                        console.log({change_index, cellX, cellY, next});
                                     }}
                                    onMoveLeft={moveLeftFromIndex}
                                    onMoveRight={moveRightFromIndex}
                                    emptyPlaceholder={emptyToken}
                                    floatingEditor={true}
                                    {...(popoverWidth != null ? { popoverWidth } : {})}
                                    labels={definedTokenLabels(labels)}
                                />
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}