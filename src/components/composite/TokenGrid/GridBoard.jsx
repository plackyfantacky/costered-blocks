import { useState, useEffect, useCallback, useRef } from '@wordpress/element';
import { Button } from '@wordpress/components';

import { toCount } from '@utils/gridUtils';
import Token from '@components/composite/Token';

export function GridBoard(props) {
    const { 
        matrix,
        columnData,
        rowData,
        setCell,
        resize,
        clear,
        emptyToken = '.',
        labels = {},
        onEditingChange
    } = props;

    const rowsArray = Array.isArray(matrix) ? matrix : [];

    const cols = toCount(columnData?.count ?? columnData) || (rowsArray[0]?.length || 0);
    const rows = toCount(rowData?.count ?? rowData) || rowsArray.length || 0;

    const safeCols = Math.max(1, cols);
    const safeRows = Math.max(1, rows);

    const [expandedIndex, setExpandedIndex] = useState(null);
    const gridRef = useRef(null);

    const indexFromXY = useCallback((x, y) => (y * safeCols) + x, [safeCols]);

    const xyFromIndex = useCallback((index) => {
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

    const handleToggle = useCallback((index, openMaybe) => {
        const shouldOpen = (typeof openMaybe === 'boolean') ? openMaybe : (expandedIndex !== index);
        setExpandedIndex(shouldOpen ? index : null);
    }, [expandedIndex]);

    const moveLeftFromIndex = useCallback((index) => {
        const [x, y] = xyFromIndex(index);
        if (x <= 0) return;
        setExpandedIndex(indexFromXY(x - 1, y));
    }, [xyFromIndex, indexFromXY]);

    const moveRightFromIndex = useCallback((index) => {
        const [x, y] = xyFromIndex(index);
        if (x >= safeCols - 1) return;
        setExpandedIndex(indexFromXY(x + 1, y));
    }, [xyFromIndex, indexFromXY, safeCols]);

    // Column/row controls
    const addColumn = useCallback(() => resize({cols: cols + 1, rows}), [resize, cols, rows]);
    const removeColumn = useCallback(() => resize({cols: Math.max(1, cols - 1), rows}), [resize, cols, rows]);
    const addRow = useCallback(() => resize({cols, rows: rows + 1}), [resize, cols, rows]);
    const removeRow = useCallback(() => resize({cols, rows: Math.max(1, rows - 1)}), [resize, cols, rows]);

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
                                    popoverWidth={gridRef.current?.offsetWidth ?? undefined}
                                    labels={{
                                        expand: labels.tokenExpand,
                                        collapse: labels.tokenCollapse,
                                        remove: labels.tokenRemove,
                                        moveLeft: labels.tokenMoveLeft,
                                        moveRight: labels.tokenMoveRight
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}