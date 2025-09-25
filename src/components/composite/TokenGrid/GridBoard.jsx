import { useState, useEffect, useCallback, useRef } from '@wordpress/element';
import { Button } from '@wordpress/components';

import Token from '@components/composite/Token';

export function GridBoard(props) {
    const { matrix, columnData, rowData, setCell, resize, clear, emptyToken = '.', labels = {}, onEditingChange } = props;

    // Ensure we never compute with 0/NaN for layout math
    const safeColumnData = Math.max(1, Number(columnData) || 0);
    const safeRowData = Math.max(1, Number(rowData) || 0);

    const [expandedIndex, setExpandedIndex] = useState(null);
    const gridRef = useRef(null);

    const indexFromXY = useCallback((x, y) => (y * safeColumnData) + x, [safeColumnData]);

    const xyFromIndex = useCallback((index) => {
        const columnIndex = index % safeColumnData;
        const rowIndex = Math.floor(index / safeColumnData);
        return [columnIndex, rowIndex];
    }, [safeColumnData]);

    useEffect(() => {
        onEditingChange?.(expandedIndex != null);
    }, [expandedIndex, onEditingChange]);

    useEffect(() => {
        setExpandedIndex((current) => {
            if (current == null) return current;
            const [x, y] = xyFromIndex(current);
            const inBounds = x < safeColumnData && y < safeRowData;
            return inBounds ? current : null;
        });
    }, [safeColumnData, safeRowData, xyFromIndex]);

    const handleToggle = useCallback((index, openMaybe) => {
        const shouldOpen = (typeof openMaybe === 'boolean')
            ? openMaybe
            : (expandedIndex !== index);
        setExpandedIndex(shouldOpen ? index : null);
    }, [expandedIndex]);

    const moveLeftFromIndex = useCallback((index) => {
        const [x, y] = xyFromIndex(index);
        if (x <= 0) return;
        setExpandedIndex(indexFromXY(x - 1, y));
    }, [xyFromIndex, indexFromXY]);

    const moveRightFromIndex = useCallback((index) => {
        const [x, y] = xyFromIndex(index);
        if (x >= safeColumnData - 1) return;
        setExpandedIndex(indexFromXY(x + 1, y));
    }, [xyFromIndex, indexFromXY, safeColumnData]);

    const areaCols = Number(columnData) || 0;
    const areaRows = Number(rowData) || 0;

    // Column/row controls
    const addColumn = useCallback(() => resize(columnData + 1, rowData), [resize, columnData, rowData]);
    const removeColumn = useCallback(() => resize(Math.max(1, columnData - 1), rowData), [resize, columnData, rowData]);
    const addRow = useCallback(() => resize(columnData, rowData + 1), [resize, columnData, rowData]);
    const removeRow = useCallback(() => resize(columnData, Math.max(1, rowData - 1)), [resize, columnData, rowData]);

    return (
        <div className="costered-blocks--token-grid--area" ref={gridRef}>
            {/* header row: column controls */}
            <div className="costered-blocks--token-grid--row costered-blocks--token-grid--row-head">
                <div className="costered-blocks--token-grid--cell costered-blocks--token-grid--cell-corner" /> { /* corner cell. usually empty */}
                {Array.from({ length: safeColumnData }).map((_, x) => (
                    <div className="costered-blocks--token-grid--cell costered-blocks--token-grid--cell-head" key={`col-${x}`}>
                        <div
                            key={`header-col-${x}`}
                            className="costered-blocks--token-grid--controls"
                        >
                            <Button
                                onClick={removeColumn}
                                disabled={areaCols <= 1}
                                variant="tertiary" icon="minus"
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
            {matrix.map((row, y) => (
                <div key={`row-${y}`} className="costered-blocks--token-grid--row">
                    {/* row controls (left gutter) */}
                    <div className="costered-blocks--token-grid--cell costered-blocks--token-grid--cell-head">
                        <div className="costered-blocks--token-grid--controls">
                            <Button
                                onClick={removeRow}
                                disabled={areaRows <= 1}
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
                                    onRemove={(index) => {
                                        const [cellX, cellY] = xyFromIndex(index);
                                        setCell(cellX, cellY, '');
                                        setExpandedIndex(null);
                                    }}
                                    onChange={(cellIndex, next) => { 
                                        const [cellX, cellY] = xyFromIndex(cellIndex); 
                                        setCell(cellX, cellY, next);
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