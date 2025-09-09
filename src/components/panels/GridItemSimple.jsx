import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Flex, FlexBlock,RangeControl, Notice } from '@wordpress/components';

import NumberControlInput from '@components/NumberControlInput';
import { LABELS } from "@labels";

import { useAttrSetter, useParentGridMeta, useGridItemBounds } from '@hooks';
import { whereGridItemDefined } from "@utils/gridUtils";
import { clamp, toInt, parsePlacementSimple, composePlacementSimple } from '@utils/gridPlacement';

const maxInteger = Number.MAX_SAFE_INTEGER;

export function GridItemSimple({ clientId, attributes}) {
    if (!clientId) return null;

    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const { set } = useAttrSetter(updateBlockAttributes, clientId);
    
    const { columns, rows } = useParentGridMeta();
    const definedIn = whereGridItemDefined(attributes);
    const isAdvancedOwned = definedIn === 'Advanced';

    // 1) Parse the CURRENT canonical shorthands each render (source of truth)
    const colNow = parsePlacementSimple(attributes.gridColumn);
    const rowNow = parsePlacementSimple(attributes.gridRow);

    const startCol = toInt(colNow.start, 1);
    const spanCol = toInt(colNow.span, 1);
    const startRow = toInt(rowNow.start, 1);
    const spanRow = toInt(rowNow.span, 1);

    // 2) Compute caps *from the current starts* and parent counts
    const hasCols = Number.isFinite(columns) && columns > 0;
    const hasRows = Number.isFinite(rows) && rows > 0;

    const colSpanCap = useMemo(() => (
        hasCols ? Math.max(1, columns - clamp(startCol, 1, columns) + 1) : maxInteger
    ), [hasCols, columns, startCol]);

    const rowSpanCap = useMemo(() => (
        hasRows ? Math.max(1, rows - clamp(startRow, 1, rows) + 1) : maxInteger
    ), [hasRows, rows, startRow]);

    // 3) Display-safe values so RangeControl always initialises
    const displayStartCol = hasCols ? clamp(startCol, 1, columns) : startCol;
    const displaySpanCol = clamp(spanCol, 1, colSpanCap);
    const displayStartRow = hasRows ? clamp(startRow, 1, rows) : startRow;
    const displaySpanRow = clamp(spanRow, 1, rowSpanCap);

    // 4) Shorthand saves only
    const saveColumn = (start, span) => set('gridColumn', composePlacementSimple(start, span, true));
    const saveRow = (start, span) => set('gridRow', composePlacementSimple(start, span, true));

    // 5) Handlers using the computed caps
    const handleColumnStartChange = (next) => {
        const start = hasCols ? clamp(toInt(next, 1), 1, columns) : toInt(next, 1);
        const cap = hasCols ? Math.max(1, columns - start + 1) : colSpanCap;
        const span = clamp(displaySpanCol, 1, cap);
        saveColumn(start, span);
    }

    const handleColumnSpanChange = (next) => {
        const span = clamp(toInt(next, 1), 1, colSpanCap);
        saveColumn(displayStartCol, span);
    }

    const handleRowStartChange = (next) => {
        const start = hasRows ? clamp(toInt(next, 1), 1, rows) : toInt(next, 1);
        const cap = hasRows ? Math.max(1, rows - start + 1) : rowSpanCap;
        const span = clamp(displaySpanRow, 1, cap);
        saveRow(start, span);
    }

    const handleRowSpanChange = (next) => {
        const span = clamp(toInt(next, 1), 1, rowSpanCap);
        saveRow(displayStartRow, span);
    }

    return (
        <Flex direction="column" gap={4} className="costered-blocks-grid-item-simple--panel">
            {isAdvancedOwned && (
                <Notice status="info" isDismissible={false}>
                    {LABELS.gridItemsControls.settingsIsAdvancedOwned}
                </Notice>
            )}
            <FlexBlock className={'costered-blocks-grid-item-simple-controls--columns'}>
                {hasCols ? (
                    <Flex direction="column" gap={2}>
                        <RangeControl
                            label={LABELS.gridItemsControls.columnStart}
                            value={displayStartCol}
                            onChange={handleColumnStartChange}
                            min={1}
                            max={columns}
                            step={1}
                            disabled={isAdvancedOwned}
                            help={sprintf(LABELS.gridItemsControls.columnStartHelp, columns)}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                        <RangeControl
                            label={LABELS.gridItemsControls.columnSpan}
                            value={displaySpanCol}
                            onChange={handleColumnSpanChange}
                            min={1}
                            max={colSpanCap}
                            step={1}
                            disabled={isAdvancedOwned}
                            help={LABELS.gridItemsControls.columnSpanHelp}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </Flex>
                ) : (
                    <Flex direction="column" gap={2}>
                        <NumberControlInput
                            label={LABELS.gridItemsControls.columnStart}
                            value={displayStartCol}
                            onChange={(value) => handleColumnStartChange(value)}
                            min={1}
                            isDragEnabled
                            disabled={isAdvancedOwned}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                        <NumberControlInput
                            label={LABELS.gridItemsControls.columnSpan}
                            value={displaySpanCol}
                            onChange={(value) => handleColumnSpanChange(value)}
                            min={1}
                            isDragEnabled
                            disabled={isAdvancedOwned}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </Flex>
                )}
            </FlexBlock>
            <FlexBlock className={'costered-blocks-grid-item-simple-controls--rows'}>
                {hasRows ? (
                    <Flex direction="column" gap={2}>
                        <RangeControl
                            label={LABELS.gridItemsControls.rowStart}
                            value={displayStartRow}
                            onChange={handleRowStartChange}
                            min={1}
                            max={rows}
                            step={1}
                            disabled={isAdvancedOwned}
                            help={sprintf(LABELS.gridItemsControls.rowStartHelp, rows)}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                        <RangeControl
                            label={LABELS.gridItemsControls.rowSpan}
                            value={displaySpanRow}
                            onChange={handleRowSpanChange}
                            min={1}
                            max={rowSpanCap}
                            step={1}
                            disabled={isAdvancedOwned}
                            help={LABELS.gridItemsControls.rowSpanHelp}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </Flex>
                ) : (
                    <Flex direction="column" gap={2}>
                        <NumberControlInput
                            label={LABELS.gridItemsControls.rowStart}
                            value={displayStartRow}
                            onChange={(value) => handleRowStartChange(value)}
                            min={1}
                            isDragEnabled
                            disabled={isAdvancedOwned}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                        <NumberControlInput
                            label={LABELS.gridItemsControls.rowSpan}
                            value={displaySpanRow}
                            onChange={(value) => handleRowSpanChange(value)}
                            min={1}
                            isDragEnabled
                            disabled={isAdvancedOwned}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </Flex>
                )}
            </FlexBlock>
        </Flex>
    );
}