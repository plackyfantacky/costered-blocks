import { __ } from '@wordpress/i18n';
import { useMemo, useCallback } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Notice, Flex, FlexItem, FlexBlock, ComboboxControl } from '@wordpress/components';

import { useAttrSetter, useParentGridMeta } from '@hooks';
import { whereGridItemDefined } from "@utils/gridUtils";
import { clamp, isIntToken, toInt, parsePlacementAdvanced, 
    composePlacementAdvanced, extractNamedLines, 
    normaliseGridAreaName, isGridPlacement } from "@utils/gridPlacement";
import { LABELS } from '@labels';
import NumberControlInput from '@components/NumberControlInput';
import CustomToggleGroup from '@components/CustomToggleGroup';
import { CustomSelectControl as SelectControl } from '@components/CustomSelectControl';

const maxInteger = Number.MAX_SAFE_INTEGER;

export function GridItemTracks({ clientId, attributes }) {
    if (!clientId) return null;

    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const { set, setMany } = useAttrSetter(updateBlockAttributes, clientId);

    const { columns, rows, areaNames, columnTemplate, rowTemplate } = useParentGridMeta();
    const definedIn = whereGridItemDefined(attributes);
    const hasArea = isGridPlacement(attributes.gridArea);
    const col = useMemo(() => parsePlacementAdvanced(attributes.gridColumn), [attributes.gridColumn]);
    const row = useMemo(() => parsePlacementAdvanced(attributes.gridRow), [attributes.gridRow]);

    // Decide per-axis placement mode from current value (end wins over span)
    const colMode = col.end ? 'end' : 'span';
    const rowMode = row.end ? 'end' : 'span';

    // Start input modes (number vs named) based on token shape
    const colStartMode = isIntToken(col.start) ? 'number' : 'named';
    const rowStartMode = isIntToken(row.start) ? 'number' : 'named';

    // End input modes (number vs named) based on token shape
    const colEndMode = col.end ? (isIntToken(col.end) ? 'number' : (col.end === 'auto' ? 'auto' : 'named')) : 'number';
    const rowEndMode = row.end ? (isIntToken(row.end) ? 'number' : (row.end === 'auto' ? 'auto' : 'named')) : 'number';

    // Named line suggestions from parent
    const namedColLines = useMemo(() => extractNamedLines(columnTemplate), [columnTemplate]);
    const namedRowLines = useMemo(() => extractNamedLines(rowTemplate), [rowTemplate]);

    const hasNamedColLines = namedColLines.length > 0;
    const hasNamedRowLines = namedRowLines.length > 0;

    // UI-effective modes (no persistence)
    const colStartModeUI = hasNamedColLines ? colStartMode : 'number';
    const rowStartModeUI = hasNamedRowLines ? rowStartMode : 'number';

    const colEndModeInferred = col.end ? (isIntToken(col.end) ? 'number' : (col.end === 'auto' ? 'auto' : 'named')) : 'number';
    const rowEndModeInferred = row.end ? (isIntToken(row.end) ? 'number' : (row.end === 'auto' ? 'auto' : 'named')) : 'number';

    // If no names, don’t show “named” as a selectable option
    const colEndModeUI = hasNamedColLines ? colEndModeInferred : (colEndModeInferred === 'named' ? 'number' : colEndModeInferred);
    const rowEndModeUI = hasNamedRowLines ? rowEndModeInferred : (rowEndModeInferred === 'named' ? 'number' : rowEndModeInferred);

    const colSpanCap = useMemo(() => {
        if (!columns || !isIntToken(col.start)) return maxInteger;
        const start = clamp(toInt(col.start, 1), 1, columns);
        return Math.max(1, columns - start + 1);
    }, [columns, col.start]);

    const rowSpanCap = useMemo(() => {
        if (!rows || !isIntToken(row.start)) return maxInteger;
        const start = clamp(toInt(row.start, 1), 1, rows);
        return Math.max(1, rows - start + 1);
    }, [rows, row.start]);

    // Writers (cannonical shorthands + gridArea)
    const writeColumn = useCallback((next) => {
        const value = next.end
            ? `${String(next.start || 'auto').trim()} / ${String(next.end || 'auto').trim()}`
            : (() => {
                const start = String(next.start || 'auto').trim();
                const num = Number(next.span);
                return n === 1 && start !== 'auto' ? start : `${start} / span ${num}`;
            })
        set('gridColumn', value);
    }, [set]);

    const writeRow = useCallback((next) => {
        const value = next.end
            ? `${String(next.start || 'auto').trim()} / ${String(next.end || 'auto').trim()}`
            : (() => {
                const start = String(next.start || 'auto').trim();
                const num = Number(next.span);
                return n === 1 && start !== 'auto' ? start : `${start} / span ${num}`;
            })();
        set('gridRow', value);
    }, [set]);

    //column controls
    const onColStartNumber = useCallback((value) => {
        const start = toInt(value, 1);
        if (col.end) {
            writeColumn({ start, end: col.end });
        } else {
            const span = clamp(toInt(col.span, 1), 1, colSpanCap);
            writeColumn({ start, span });
        }
    }, [col.end, col.span, colSpanCap, writeColumn]);

    const onColStartNamed = useCallback((value) => {
        const start = String(value || 'auto').trim() || 'auto';
        if (col.end) writeColumn({ start, end: col.end });
        else writeColumn({ start, span: toInt(col.span, 1) });
    }, [col.end, col.span, writeColumn]);

    const onColSpan = useCallback((value) => {
        const span = clamp(toInt(value, 1), 1, colSpanCap);
        writeColumn({ start: col.start || 'auto', span });
    }, [col.start, colSpanCap, writeColumn]);

    const onColEndNumber = useCallback((value) => {
        writeColumn({ start: col.start || 'auto', end: toInt(value, 1) });
    }, [col.start, writeColumn]);

    const onColEndNamed = useCallback((value) => {
        writeColumn({ start: col.start || 'auto', end: String(value || 'auto').trim() || 'auto' });
    }, [col.start, writeColumn]);

    const onColEndAuto = useCallback(() => {
        writeColumn({ start: col.start || 'auto', end: 'auto' });
    }, [col.start, writeColumn]);

    onColChangeMode = useCallback((mode) => {
        if (mode === 'end') {
            // switch to end mode, drop span, default end = 'auto'
            writeColumn({ start: col.start || 'auto', end: col.end || 'auto' });
        } else {
            // switch to span mode, drop end, default span = 1
            writeColumn({ start: col.start || 'auto', span: toInt(col.span, 1) });
        }
    }, [col.start, col.end, col.span, writeColumn]);

    //row controls
    const onRowStartNumber = useCallback((value) => {
        const start = toInt(value, 1);
        if (row.end) {
            writeRow({ start, end: row.end });
        } else {
            const span = clamp(toInt(row.span, 1), 1, rowSpanCap);
            writeRow({ start, span });
        }
    }, [row.end, row.span, rowSpanCap, writeRow]);

    const onRowStartNamed = useCallback((value) => {
        const start = String(value || 'auto').trim() || 'auto';
        if (row.end) writeRow({ start, end: row.end });
        else writeRow({ start, span: toInt(row.span, 1) });
    }, [row.end, row.span, writeRow]);

    const onRowSpan = useCallback((value) => {
        const span = clamp(toInt(value, 1), 1, rowSpanCap);
        writeRow({ start: row.start || 'auto', span });
    }, [row.start, rowSpanCap, writeRow]);

    const onRowEndNumber = useCallback((value) => {
        writeRow({ start: row.start || 'auto', end: toInt(value, 1) });
    }, [row.start, writeRow]);

    const onRowEndNamed = useCallback((value) => {
        writeRow({ start: row.start || 'auto', end: String(value || 'auto').trim() || 'auto' });
    }, [row.start, writeRow]);

    const onRowEndAuto = useCallback(() => {
        writeRow({ start: row.start || 'auto', end: 'auto' });
    }, [row.start, writeRow]);

    onRowChangeMode = useCallback((mode) => {
        if (mode === 'end') {
            // switch to end mode, drop span, default end = 'auto'
            writeRow({ start: row.start || 'auto', end: row.end || 'auto' });
        } else {
            // switch to span mode, drop end, default span = 1
            writeRow({ start: row.start || 'auto', span: toInt(row.span, 1) });
        }
    }, [row.start, row.end, row.span, writeRow]);

    const disabledLines = hasArea;

    return (
        <Flex direction="column" gap={4} className="costered-blocks-grid-item-advanced--panel">
            {hasArea && (
                <Notice status="info" isDismissible={false}>
                    {LABELS.gridItemsControls.settingsHasArea}
                </Notice>
            )}
            {/* Columns placement */}
            <FlexBlock className={'costered-blocks-grid-item-advanced-controls--column-placement'}>
                <fieldset className="costered-blocks-grid-item-advanced-controls--fieldset">
                    <legend className="components-base-control__label">{LABELS.gridItemsControls.columnStart}</legend>
                    {/* Placement mode: Span vs End */}
                    <CustomToggleGroup
                        label={LABELS.gridItemsControls.columnPlacementMode}
                        value={colMode}
                        onChange={onColChangeMode}
                        disabled={disabledLines}
                        isBlock
                    >
                        <CustomToggleGroup.TextOption value="span" label={LABELS.gridItemsControls.columnPlacementSpan} />
                        <CustomToggleGroup.TextOption value="end" label={LABELS.gridItemsControls.columnPlacementEnd} />
                    </CustomToggleGroup>

                    {/* Start mode selector: hide entirely if no names */}
                    {hasNamedColLines && (
                        <SelectControl
                            label={LABELS.gridItemsControls.columnStartMode}
                            value={colStartModeUI}
                            options={[
                                { label: LABELS.gridItemsControls.columnStartModeNumber, value: 'number' },
                                { label: LABELS.gridItemsControls.columnStartModeNamed, value: 'named' },
                            ]}
                            onChange={(m) => {
                                // just flip control rendering; value persists as-is
                                // no-op, since we infer mode from token; user will type/select accordingly
                            }}
                            disabled={disabledLines}
                        />
                    )}
                    {/* Start input */}
                    {colStartModeUI === 'number' ? (
                        <NumberControlInput
                            label={LABELS.gridItemsControls.columnStart}
                            value={isIntToken(col.start) ? toInt(col.start, 1) : 1}
                            onChange={onColStartNumber}
                            // allow 0 and negative for auto-placement
                            disabled={disabledLines}
                        />
                    ) : (
                        <ComboboxControl
                            label={LABELS.gridItemsControls.columnStartNamed}
                            value={!isIntToken(col.start) ? (col.start || '') : ''}
                            options={namedColLines.map((line) => ({ label: line, value: line }))}
                            onChange={onColStartNamed}
                            allowReset
                            disabled={disabledLines}
                            help={LABELS.gridItemsControls.columnStartNamedHelp}
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                        />
                    )}
                    {/* heads-up if value is named but parent has no names */}
                    {!hasNamedColLines && !isIntToken(col.start) && col.start && (
                        <Notice status="info" isDismissible={false}>
                            {LABELS.gridItemsControls.columnStartNameMismatch}
                        </Notice>
                    )}
                    {/* Span vs End inputs */}
                    {colMode === 'span' ? (
                        <NumberControlInput
                            label={LABELS.gridItemsControls.columnSpan}
                            value={toInt(col.span, 1)}
                            onChange={onColSpan}
                            min={1}
                            max={Number.isFinite(colSpanCap) ? colSpanCap : undefined}
                            isDragEnabled
                            disabled={disabledLines}
                            help={columns ? LABELS.gridItemsControls.columnSpanParentHelp : undefined}
                        />
                    ) : (
                        <>
                            {/* End mode: drop the "Named" option if no names */}
                            <SelectControl
                                label={LABELS.gridItemsControls.columnEndMode}
                                value={colEndModeUI}
                                options={
                                    hasNamedColLines
                                        ? [
                                            { label: LABELS.gridItemsControls.columnEndModeNumber, value: 'number' },
                                            { label: LABELS.gridItemsControls.columnEndModeNamed, value: 'named' },
                                            { label: LABELS.gridItemsControls.columnEndModeAuto, value: 'auto' },
                                        ] : [
                                            { label: LABELS.gridItemsControls.columnEndModeNumber, value: 'number' },
                                            { label: LABELS.gridItemsControls.columnEndModeAuto, value: 'auto' },
                                        ]
                                }
                                onChange={(m) => {
                                    if (m === 'auto') onColEndAuto();
                                    // switching to number/named just changes the visible control;
                                    // actual value is set by the control below
                                }}
                                disabled={disabledLines}
                            />
                            {colEndModeUI === 'number' && (
                                <NumberControlInput
                                    label={LABELS.gridItemsControls.columnEndNumber}
                                    value={isIntToken(col.end) ? toInt(col.end, 1) : 1}
                                    onChange={onColEndNumber}
                                    isDragEnabled
                                    disabled={disabledLines}
                                    help={LABELS.gridItemsControls.columnEndNumberHelp}
                                />
                            )}
                            {colEndModeUI === 'named' && (
                                <ComboboxControl
                                    label={LABELS.gridItemsControls.columnEndNamed}
                                    value={!isIntToken(col.end) && col.end !== 'auto' ? (col.end || '') : ''}
                                    options={namedColLines.map((line) => ({ label: line, value: line }))}
                                    onChange={onColEndNamed}
                                    allowReset
                                    disabled={disabledLines}
                                    help={LABELS.gridItemsControls.columnEndNamedHelp}
                                    __nextHasNoMarginBottom
                                    __next40pxDefaultSize
                                />
                            )}
                            {!hasNamedColLines && !isIntToken(col.end) && col.end && col.end !== 'auto' && (
                                <Notice status="info" isDismissible={false}>
                                    {LABELS.gridItemsControls.columnEndNameMismatch}
                                </Notice>
                            )}
                        </>
                    )}
                </fieldset>
            </FlexBlock>
        </Flex>
    );
};