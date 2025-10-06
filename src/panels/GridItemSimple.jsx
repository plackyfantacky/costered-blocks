import { sprintf } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { Flex, FlexBlock, RangeControl } from '@wordpress/components';

import NumberControlInput from '@components/NumberControlInput';
import { LABELS } from "@labels";

import { useAttrGetter, useAttrSetter, useParentGridMeta } from '@hooks';
import { clamp, toInt, parsePlacementSimple, composePlacementSimple, isGridPlacement } from '@utils/gridPlacement';

const VIRTUAL_TRACKS = 24; // a sane amount

export function GridItemSimple({ clientId }) {
    if (!clientId) return null;

    const { get } = useAttrGetter(clientId);
    const { set } = useAttrSetter(clientId);

    const { columnCount, rowCount } = useParentGridMeta(clientId);
    const hasArea = isGridPlacement(get('gridArea'));

    // 1) Parse the CURRENT canonical shorthands each render (source of truth)
    const colNow = parsePlacementSimple(get('gridColumn'));
    const rowNow = parsePlacementSimple(get('gridRow'));

    const startCol = toInt(colNow.start, 1);
    const spanCol = toInt(colNow.span, 1);
    const startRow = toInt(rowNow.start, 1);
    const spanRow = toInt(rowNow.span, 1);

    // 2) Compute caps *from the current starts* and parent counts
    const hasCols = Number.isFinite(columnCount) && columnCount > 0;
    const hasRows = Number.isFinite(rowCount) && rowCount > 0;

    const effectiveCols = hasCols ? columnCount : VIRTUAL_TRACKS;
    const effectiveRows = hasRows ? rowCount : VIRTUAL_TRACKS;

    // 3) Compute span caps
    const colSpanCap = useMemo(() => {
        const start = clamp(startCol, 1, effectiveCols);
        return Math.max(1, effectiveCols - start + 1);
    }, [effectiveCols, startCol]);

    const rowSpanCap = useMemo(() => {
        const start = clamp(startRow, 1, effectiveRows);
        return Math.max(1, effectiveRows - start + 1);
    }, [effectiveRows, startRow]);

    // 4) Display-safe values so RangeControl always initialises
    const displayStartCol = clamp(startCol, 1, effectiveCols);
    const displaySpanCol = clamp(spanCol, 1, colSpanCap);
    const displayStartRow = clamp(startRow, 1, effectiveRows);
    const displaySpanRow = clamp(spanRow, 1, rowSpanCap);

    // 5) Shorthand saves only
    const saveColumn = (start, span) => set('gridColumn', composePlacementSimple(start, span, true));
    const saveRow = (start, span) => set('gridRow', composePlacementSimple(start, span, true));

    // 6) Handlers using the computed caps
    const handleColumnStartChange = (next) => {
        const start = clamp(toInt(next, 1), 1, effectiveCols);
        const cap = Math.max(1, effectiveCols - start + 1);
        const span = clamp(displaySpanCol, 1, cap);
        saveColumn(start, span);
    };

    const handleColumnSpanChange = (next) => {
        const span = clamp(toInt(next, 1), 1, colSpanCap);
        saveColumn(displayStartCol, span);
    };

    const handleRowStartChange = (next) => {
        const start = clamp(toInt(next, 1), 1, effectiveRows);
        const cap = Math.max(1, effectiveRows - start + 1);
        const span = clamp(displaySpanRow, 1, cap);
        saveRow(start, span);
    };

    const handleRowSpanChange = (next) => {
        const span = clamp(toInt(next, 1), 1, rowSpanCap);
        saveRow(displayStartRow, span);
    };

    // disable if using grid-area
    const disabledSimple = hasArea;

    return (
        <Flex direction="column" gap={4} className="costered-blocks-grid-item-simple--panel">
            <FlexBlock className={'costered-blocks-grid-item-simple-controls--columns'}>
                <Flex direction="column" gap={2}>
                    <RangeControl
                        label={LABELS.gridItemsControls.simplePanel.columnStart}
                        value={displayStartCol}
                        onChange={handleColumnStartChange}
                        min={1}
                        max={effectiveCols}
                        step={1}
                        disabled={disabledSimple}
                        help={
                            hasCols
                                ? sprintf(LABELS.gridItemsControls.simplePanel.columnStartHelp, columnCount)
                                : LABELS.gridItemsControls.simplePanel.columnStartHelpUnknown
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <RangeControl
                        label={LABELS.gridItemsControls.simplePanel.columnSpan}
                        value={displaySpanCol}
                        onChange={handleColumnSpanChange}
                        min={1}
                        max={colSpanCap}
                        step={1}
                        disabled={disabledSimple}
                        help={LABELS.gridItemsControls.simplePanel.columnSpanHelp}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                </Flex>
            </FlexBlock>
            <FlexBlock className={'costered-blocks-grid-item-simple-controls--rows'}>
                <Flex direction="column" gap={2}>
                    <RangeControl
                        label={LABELS.gridItemsControls.simplePanel.rowStart}
                        value={displayStartRow}
                        onChange={handleRowStartChange}
                        min={1}
                        max={effectiveRows}
                        step={1}
                        disabled={disabledSimple}
                        help={
                            hasRows
                                ? sprintf(LABELS.gridItemsControls.simplePanel.rowStartHelp, rowCount)
                                : LABELS.gridItemsControls.simplePanel.rowStartHelpUnknown
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <RangeControl
                        label={LABELS.gridItemsControls.simplePanel.rowSpan}
                        value={displaySpanRow}
                        onChange={handleRowSpanChange}
                        min={1}
                        max={rowSpanCap}
                        step={1}
                        disabled={disabledSimple}
                        help={LABELS.gridItemsControls.simplePanel.rowSpanHelp}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                </Flex>
            </FlexBlock>
        </Flex>
    );
}