import { sprintf } from '@wordpress/i18n';
import { useMemo, useRef } from '@wordpress/element';
import { Flex, FlexBlock, RangeControl } from '@wordpress/components';


import { LABELS } from "@labels";

import { useAttrGetter, useAttrSetter, useParentGridMeta } from '@hooks';
import { clamp, toInt, parsePlacementSimple, composePlacementSimple, isGridPlacement } from '@utils/gridPlacement';

type Props = {
    clientId: string | null;
};

const VIRTUAL_TRACKS = 24; // a sane amount

/**
 * Handle span changes, skipping 0 while allowing positive and negative integers.
 * If the user reaches 0, we nudge them to 1 or -1 depending on direction.
 */
function handleSpanChangeSkippingZero(
    next: number | undefined,
    lastRef: { current: number },
    cap: number,
    save: (span: number) => void
) {
    let span = toInt(next, 1);
    const last = lastRef.current;

    if (span === 0) {
        // Nudge away from zero
        span = last > 0 ? -1 : 1;
    }

    span = clamp(span, -cap, cap);
    lastRef.current = span;
    save(span);
}


export function GridItemSimple({ clientId }: Props) {
    if (!clientId) return null;

    const { get } = useAttrGetter(clientId);
    const { set } = useAttrSetter(clientId);

    const { columns, rows } = useParentGridMeta(clientId);
    const hasArea = isGridPlacement(String(get('gridArea') ?? ''));

    // 1) Parse the CURRENT canonical shorthands each render (source of truth)
    const colNow = parsePlacementSimple(String(get('gridColumn') ?? ''));
    const rowNow = parsePlacementSimple(String(get('gridRow') ?? ''));

    const startCol = toInt(colNow.start, 1);
    const spanCol = toInt(colNow.span, 1);
    const startRow = toInt(rowNow.start, 1);
    const spanRow = toInt(rowNow.span, 1);

    // 2) Compute caps *from the current starts* and parent counts
    const hasCols = Number.isFinite(columns) && (columns ?? 0) > 0;
    const hasRows = Number.isFinite(rows) && (rows ?? 0) > 0;

    const effectiveCols = hasCols ? (columns as number) : VIRTUAL_TRACKS;
    const effectiveRows = hasRows ? (rows as number) : VIRTUAL_TRACKS;

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
    const displayStartRow = clamp(startRow, 1, effectiveRows);

    // 4a) Refs to track last span values for skipping zero
    const displaySpanCol = spanCol === 0 ? 1 : clamp(spanCol, -colSpanCap, colSpanCap);
    const displaySpanRow = spanRow === 0 ? 1 : clamp(spanRow, -rowSpanCap, rowSpanCap);

    const lastSpanColRef = useRef<number>(displaySpanCol);
    const lastSpanRowRef = useRef<number>(displaySpanRow);

    // 5) Shorthand saves only
    const saveColumn = (start: number, span: number) => 
        set('gridColumn', composePlacementSimple(start, span, true));
    const saveRow = (start: number, span: number) => 
        set('gridRow', composePlacementSimple(start, span, true));

    // 6) Handlers using the computed caps
    const handleColumnStartChange = (next?: number) => {
        const start = clamp(toInt(next, 1), 1, effectiveCols);
        const cap = Math.max(1, effectiveCols - start + 1);
        const span = clamp(displaySpanCol, 1, cap);
        saveColumn(start, span);
    };

    const handleRowStartChange = (next?: number) => {
        const start = clamp(toInt(next, 1), 1, effectiveRows);
        const cap = Math.max(1, effectiveRows - start + 1);
        const span = clamp(displaySpanRow, 1, cap);
        saveRow(start, span);
    };

    const handleColumnSpanChange = (next?: number) => {
        handleSpanChangeSkippingZero(next, lastSpanColRef, colSpanCap, (span) => 
            saveColumn(displayStartCol, span)
        );
    };

    const handleRowSpanChange = (next?: number) => {
        handleSpanChangeSkippingZero(next, lastSpanRowRef, rowSpanCap, (span) => 
            saveRow(displayStartRow, span)
        );
    };

    // disable if using grid-area
    const disabledSimple = hasArea;

    return (
        <Flex direction="column" gap={4} className="costered-blocks--griditems-simple--panel">
            <fieldset className="costered-blocks--fieldset costered-blocks--griditems-simple--column-controls">
                <legend>{LABELS.gridItemsControls.simplePanel.columnLegend}</legend>
                <FlexBlock className={'costered-blocks--griditems-simple--column-controls-inner'}>
                    <Flex direction="column" gap={4}>
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
                                    ? sprintf(LABELS.gridItemsControls.simplePanel.columnStartHelp, columns as number)
                                    : LABELS.gridItemsControls.simplePanel.columnStartHelpUnknown
                            }
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                        <RangeControl
                            label={LABELS.gridItemsControls.simplePanel.columnSpan}
                            value={displaySpanCol}
                            onChange={handleColumnSpanChange}
                            min={-colSpanCap}
                            max={colSpanCap}
                            step={1}
                            disabled={disabledSimple}
                            help={LABELS.gridItemsControls.simplePanel.columnSpanHelp}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </Flex>
                </FlexBlock>
            </fieldset>
            <fieldset className="costered-blocks--fieldset costered-blocks--griditems-simple--controls">
                <legend>{LABELS.gridItemsControls.simplePanel.rowLegend}</legend>
                <FlexBlock className={'costered-blocks--griditems-simple--controls-inner'}>
                    <Flex direction="column" gap={4}>
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
                                    ? sprintf(LABELS.gridItemsControls.simplePanel.rowStartHelp, rows as number)
                                    : LABELS.gridItemsControls.simplePanel.rowStartHelpUnknown
                            }
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                        <RangeControl
                            label={LABELS.gridItemsControls.simplePanel.rowSpan}
                            value={displaySpanRow}
                            onChange={handleRowSpanChange}
                            min={-rowSpanCap}
                            max={rowSpanCap}
                            step={1}
                            disabled={disabledSimple}
                            help={LABELS.gridItemsControls.simplePanel.rowSpanHelp}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </Flex>
                </FlexBlock>
            </fieldset>
        </Flex>
    );
}