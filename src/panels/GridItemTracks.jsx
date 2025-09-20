import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Notice, Flex, FlexItem, FlexBlock, ComboboxControl } from '@wordpress/components';

import { LABELS } from '@labels';
import {
    useAttrSetter, useParentGridMeta, useGridItemTracksController,
    useScopedKey, useUIPreferences, useSafeBlockName
} from '@hooks';
import { isIntToken, toInt } from "@utils/gridPlacement";

import { AxisStartNumber, AxisStartNamed, AxisSpan, AxisEndNumber, AxisEndNamed } from '@components/composite/GridItemControls';

import CustomToggleGroup from '@components/CustomToggleGroup';
import { CustomSelectControl as SelectControl } from '@components/CustomSelectControl';

export function GridItemTracks({ clientId, attributes, parentAttrs, safeBlockName }) {
    if (!clientId) return null;
    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const { setMany } = useAttrSetter(updateBlockAttributes, clientId);
    const parentMeta = useParentGridMeta();

    const ctrl = useGridItemTracksController({ attributes, setMany, parentMeta });

    const gridColStartModeKey = useScopedKey('gridColStartMode', { blockName: safeBlockName });
    const gridColEndModeKey = useScopedKey('gridColEndMode', { blockName: safeBlockName });
    const [gridColStartMode, setGridColStartMode] = useUIPreferences(gridColStartModeKey, 'simple');
    const [gridColEndMode, setGridColEndMode] = useUIPreferences(gridColEndModeKey, 'number');

    const gridRowStartModeKey = useScopedKey('gridRowStartMode', { blockName: safeBlockName });
    const gridRowEndModeKey = useScopedKey('gridRowEndMode', { blockName: safeBlockName });
    const [gridRowStartMode, setGridRowStartMode] = useUIPreferences(gridRowStartModeKey, 'simple');
    const [gridRowEndMode, setGridRowEndMode] = useUIPreferences(gridRowEndModeKey, 'number');

    const onColStartChangeMode = useCallback((mode) => {
        const { start: colStart } = ctrl.column.values;
        const { onStartNumber, onStartNamed } = ctrl.column.handlers;
        const { hasLines, lines } = ctrl.column.named;

        if (mode === 'number') {
            const fallback = isIntToken(colStart) ? toInt(colStart, 1) : 1;
            onStartNumber(fallback);
        } else if (mode === 'named') {
            if (hasLines) {
                const fallback = (!isIntToken(colStart) && colStart) || lines[0] || '';
                onStartNamed(fallback);
            } else {
                onStartNumber(1);
            }
        }
        //also save to user prefs
        setGridColStartMode(mode);
    }, [ctrl.column.values, ctrl.column.named, ctrl.handlers]);

    const onColEndChangeMode = useCallback((mode) => {
        const { end: colEnd, start: colStart } = ctrl.column.values;
        const { onEndAuto, onEndNumber, onEndNamed } = ctrl.column.handlers;
        const { hasLines, lines } = ctrl.column.named;

        if (mode === 'auto') { onEndAuto(); return; }
        if (mode === 'number') {
            const fallback = isIntToken(colEnd) ? toInt(colEnd, 1) : (isIntToken(colStart) ? toInt(colStart, 1) : 1);
            onEndNumber(fallback);
            return;
        }
        if (mode === 'named') {
            if (hasLines) {
                const fallback = (!isIntToken(colEnd) && colEnd !== 'auto' && colEnd) || lines[0] || '';
                onEndNamed(fallback);
            } else {
                onEndNumber(1);
            }
        }
        //also save to user prefs
        setGridColEndMode(mode);
    }, [ctrl.column.values, ctrl.column.named, ctrl.handlers]);

    const onRowStartChangeMode = useCallback((mode) => {
        const { start: rowStart } = ctrl.row.values;
        const { onStartNumber, onStartNamed } = ctrl.row.handlers;
        const { hasLines, lines } = ctrl.row.named;

        if (mode === 'number') {
            const fallback = isIntToken(rowStart) ? toInt(rowStart, 1) : 1;
            onStartNumber(fallback);
        } else if (mode === 'named') {
            if (hasLines) {
                const fallback = (!isIntToken(rowStart) && rowStart) || lines[0] || '';
                onStartNamed(fallback);
            } else {
                onStartNumber(1);
            }
        }
    }, [ctrl.row.values, ctrl.row.named, ctrl.handlers]);

    const onRowEndChangeMode = useCallback((mode) => {
        const { end: rowEnd, start: rowStart } = ctrl.row.values;
        const { onEndAuto, onEndNumber, onEndNamed } = ctrl.row.handlers;
        const { hasLines, lines } = ctrl.row.named;

        if (mode === 'auto') { onEndAuto(); return; }
        if (mode === 'number') {
            const fallback = isIntToken(rowEnd) ? toInt(rowEnd, 1) : (isIntToken(rowStart) ? toInt(rowStart, 1) : 1);
            onEndNumber(fallback);
            return;
        }
        if (mode === 'named') {
            if (hasLines) {
                const fallback = (!isIntToken(rowEnd) && rowEnd !== 'auto' && rowEnd) || lines[0] || '';
                onEndNamed(fallback);
            } else {
                onEndNumber(1);
            }
        }
    }, [ctrl.row.values, ctrl.row.named, ctrl.handlers]);

    return (
        <Flex direction="column" gap={4} className="costered-blocks-grid-item-tracks--panel">
            {ctrl.hasArea && (
                <Notice status="info" isDismissible={false}>
                    {LABELS.gridItemsControls.tracksPanel.hasAreasNotice}
                </Notice>
            )}
            {/* Columns placement */}
            <fieldset className="costered-blocks-grid-item-tracks-controls--columns">
                <legend className="components-base-control__label">{LABELS.gridItemsControls.tracksPanel.columns.legend}</legend>
                <FlexBlock className={'costered-blocks-grid-item-tracks-controls--column-placement'}>
                    <Flex direction="column" gap={4}>
                        {ctrl.column.named.hasLines && (
                            <FlexBlock>
                                <SelectControl
                                    label={LABELS.gridItemsControls.tracksPanel.columns.trackStartMode}
                                    value={gridColStartMode} //loaded from user prefs
                                    onChange={onColStartChangeMode} //saved to user prefs
                                    disabled={ctrl.disabledLines}
                                >
                                    <SelectControl.Option value="number">{LABELS.gridItemsControls.tracksPanel.columns.trackStartModeNumber}</SelectControl.Option>
                                    <SelectControl.Option value="named">{LABELS.gridItemsControls.tracksPanel.columns.trackStartModeNamed}</SelectControl.Option>
                                </SelectControl>
                            </FlexBlock>
                        )}
                        {/* Start input */}
                        {ctrl.column.modes.uiStart === 'number' ? (
                            <FlexBlock>
                                <AxisStartNumber
                                    label={LABELS.gridItemsControls.tracksPanel.columns.startNumber}
                                    help={LABELS.gridItemsControls.tracksPanel.columns.startNumberHelp}
                                    value={ctrl.column.values.start}
                                    onChange={ctrl.column.handlers.onStartNumber}
                                    disabled={ctrl.disabledLines}
                                />
                            </FlexBlock>
                        ) : (
                            <FlexBlock>
                                <AxisStartNamed
                                    label={LABELS.gridItemsControls.tracksPanel.columns.startNamed}
                                    help={LABELS.gridItemsControls.tracksPanel.columns.startNamedHelp}
                                    value={ctrl.column.values.start}
                                    options={ctrl.column.named.lines}
                                    onChange={ctrl.column.handlers.onStartNamed}
                                    disabled={ctrl.disabledLines}
                                />
                            </FlexBlock>
                        )}
                        {/* heads-up if value is named but parent has no names */}
                        {!ctrl.column.named.hasLines && !isIntToken(ctrl.column.values.start) && ctrl.column.values.start && (
                            <FlexBlock>
                                <Notice status="info" isDismissible={false}>
                                    {LABELS.gridItemsControls.tracksPanel.namedLineMismatch}
                                </Notice>
                            </FlexBlock>
                        )}
                        {/* Placement mode: Span vs End */}
                        <FlexBlock>
                            <CustomToggleGroup
                                label={LABELS.gridItemsControls.tracksPanel.columns.trackEndMode}
                                value={ctrl.column.modes.mode}
                                onChange={ctrl.column.setMode}
                                disabled={ctrl.disabledLines}
                                isBlock
                            >
                                <CustomToggleGroup.TextOption value="span" label={LABELS.gridItemsControls.tracksPanel.columns.trackEndModeSpan} />
                                <CustomToggleGroup.TextOption value="end" label={LABELS.gridItemsControls.tracksPanel.columns.trackEndModeEnd} />
                            </CustomToggleGroup>
                        </FlexBlock>
                        {/* Span vs End inputs */}
                        {ctrl.column.modes.mode === 'span' ? (
                            <FlexBlock>
                                <AxisSpan
                                    label={LABELS.gridItemsControls.tracksPanel.columns.endSpan}
                                    help={LABELS.gridItemsControls.tracksPanel.columns.endSpanHelp}
                                    value={ctrl.column.values.span}
                                    cap={ctrl.column.caps.span}
                                    onChange={ctrl.column.handlers.onSpan}
                                    disabled={ctrl.disabledLines}
                                />
                            </FlexBlock>
                        ) : (
                            <FlexBlock>
                                <Flex direction="column" gap={2}>
                                    <FlexBlock>
                                        {/* End mode: drop the "Named" option if no names */}
                                        <SelectControl
                                            label={LABELS.gridItemsControls.tracksPanel.columns.endMode}
                                            value={gridColEndMode}
                                            onChange={(mode) => onColEndChangeMode(mode)} // this handler is locally defined
                                            disabled={ctrl.disabledLines}
                                        >
                                            <SelectControl.Option value="auto">{LABELS.gridItemsControls.tracksPanel.columns.endAuto}</SelectControl.Option>
                                            <SelectControl.Option value="number">{LABELS.gridItemsControls.tracksPanel.columns.endNumber}</SelectControl.Option>
                                            {ctrl.column.named.hasLines && (
                                                <SelectControl.Option value="named">{LABELS.gridItemsControls.tracksPanel.columns.endNamed}</SelectControl.Option>
                                            )}
                                        </SelectControl>
                                    </FlexBlock>
                                    {ctrl.column.modes.uiEnd === 'number' && (
                                        <FlexBlock>
                                            <AxisEndNumber
                                                label={LABELS.gridItemsControls.tracksPanel.columns.endNumber}
                                                help={LABELS.gridItemsControls.tracksPanel.columns.endNumberHelp}
                                                token={ctrl.column.values.end}
                                                draftValue={ctrl.column.drafts.end}
                                                onChange={ctrl.column.handlers.onEndNumber}
                                                disabled={ctrl.disabledLines}
                                                zeroNotice={LABELS.gridItemsControls.tracksPanel.zeroInvalid}
                                            />
                                        </FlexBlock>
                                    )}
                                    {ctrl.column.modes.uiEnd === 'named' && (
                                        <FlexBlock>
                                            <AxisEndNamed
                                                label={LABELS.gridItemsControls.tracksPanel.columns.endNamed}
                                                help={LABELS.gridItemsControls.tracksPanel.columns.endNamedHelp}
                                                value={ctrl.column.values.end}
                                                options={ctrl.column.named.lines}
                                                onChange={ctrl.column.handlers.onEndNamed}
                                                hasNamed={ctrl.column.named.hasLines}
                                                mismatchNotice={LABELS.gridItemsControls.tracksPanel.namedLineMismatch}
                                                disabled={ctrl.disabledLines}
                                            />
                                        </FlexBlock>

                                    )}
                                </Flex>
                            </FlexBlock>
                        )}
                    </Flex>
                </FlexBlock>
            </fieldset>
            {/* Rows placement */}
            <fieldset className="costered-blocks-grid-item-tracks-controls--rows">
                <legend className="components-base-control__label">{LABELS.gridItemsControls.tracksPanel.rows.legend}</legend>
                <FlexBlock className={'costered-blocks-grid-item-tracks-controls--row-placement'}>
                    <Flex direction="column" gap={4}>
                        {ctrl.row.named.hasLines && (
                            <FlexBlock>
                                <SelectControl
                                    label={LABELS.gridItemsControls.tracksPanel.rows.trackStartMode}
                                    value={gridRowStartMode} //loaded from user prefs
                                    onChange={onRowStartChangeMode} //saved to user prefs
                                    disabled={ctrl.disabledLines}
                                >
                                    <SelectControl.Option value="number">{LABELS.gridItemsControls.tracksPanel.rows.trackStartModeNumber}</SelectControl.Option>
                                    <SelectControl.Option value="named">{LABELS.gridItemsControls.tracksPanel.rows.trackStartModeNamed}</SelectControl.Option>
                                </SelectControl>
                            </FlexBlock>
                        )}
                        {/* Start input */}
                        {ctrl.row.modes.uiStart === 'number' ? (
                            <FlexBlock>
                                <AxisStartNumber
                                    label={LABELS.gridItemsControls.tracksPanel.rows.startNumber}
                                    help={LABELS.gridItemsControls.tracksPanel.rows.startNumberHelp}
                                    value={ctrl.row.values.start}
                                    onChange={ctrl.row.handlers.onStartNumber}
                                    disabled={ctrl.disabledLines}
                                />
                            </FlexBlock>
                        ) : (
                            <FlexBlock>
                                <AxisStartNamed
                                    label={LABELS.gridItemsControls.tracksPanel.rows.startNamed}
                                    help={LABELS.gridItemsControls.tracksPanel.rows.startNamedHelp}
                                    value={ctrl.row.values.start}
                                    options={ctrl.row.named.lines}
                                    onChange={ctrl.row.handlers.onStartNamed}
                                    disabled={ctrl.disabledLines}
                                />
                            </FlexBlock>
                        )}
                        {/* heads-up if value is named but parent has no names */}
                        {!ctrl.row.named.hasLines && !isIntToken(ctrl.row.values.start) && ctrl.row.values.start && (
                            <FlexBlock>
                                <Notice status="info" isDismissible={false}>
                                    {LABELS.gridItemsControls.tracksPanel.namedLineMismatch}
                                </Notice>
                            </FlexBlock>
                        )}
                        {/* Placement mode: Span vs End */}
                        <FlexBlock>
                            <CustomToggleGroup
                                label={LABELS.gridItemsControls.tracksPanel.rows.trackEndMode}
                                value={ctrl.row.modes.mode}
                                onChange={ctrl.row.setMode}
                                disabled={ctrl.disabledLines}
                                isBlock
                            >
                                <CustomToggleGroup.TextOption value="span" label={LABELS.gridItemsControls.tracksPanel.rows.trackEndModeSpan} />
                                <CustomToggleGroup.TextOption value="end" label={LABELS.gridItemsControls.tracksPanel.rows.trackEndModeEnd} />
                            </CustomToggleGroup>
                        </FlexBlock>
                        {/* Span vs End inputs */}
                        {ctrl.row.modes.mode === 'span' ? (
                            <FlexBlock>
                                <AxisSpan
                                    label={LABELS.gridItemsControls.tracksPanel.rows.endSpan}
                                    help={LABELS.gridItemsControls.tracksPanel.rows.endSpanHelp}
                                    value={ctrl.row.values.span}
                                    cap={ctrl.row.caps.span}
                                    onChange={ctrl.row.handlers.onSpan}
                                    disabled={ctrl.disabledLines}
                                />
                            </FlexBlock>
                        ) : (
                            <FlexBlock>
                                <Flex direction="column" gap={2}>
                                    <FlexBlock>
                                        {/* End mode: drop the "Named" option if no names */}
                                        <SelectControl
                                            label={LABELS.gridItemsControls.tracksPanel.rows.endMode}
                                            value={gridRowEndMode}
                                            onChange={(mode) => onRowEndChangeMode(mode)} // this handler is locally defined
                                            disabled={ctrl.disabledLines}
                                        >
                                            <SelectControl.Option value="auto">{LABELS.gridItemsControls.tracksPanel.rows.endAuto}</SelectControl.Option>
                                            <SelectControl.Option value="number">{LABELS.gridItemsControls.tracksPanel.rows.endNumber}</SelectControl.Option>
                                            {ctrl.row.named.hasLines && (
                                                <SelectControl.Option value="named">{LABELS.gridItemsControls.tracksPanel.rows.endNamed}</SelectControl.Option>
                                            )}
                                        </SelectControl>
                                    </FlexBlock>
                                    {ctrl.row.modes.uiEnd === 'number' && (
                                        <FlexBlock>
                                            <AxisEndNumber
                                                label={LABELS.gridItemsControls.tracksPanel.rows.endNumber}
                                                help={LABELS.gridItemsControls.tracksPanel.rows.endNumberHelp}
                                                token={ctrl.row.values.end}
                                                draftValue={ctrl.row.drafts.end}
                                                onChange={ctrl.row.handlers.onEndNumber}
                                                disabled={ctrl.disabledLines}
                                                zeroNotice={LABELS.gridItemsControls.tracksPanel.zeroInvalid}
                                            />
                                        </FlexBlock>
                                    )}
                                    {ctrl.row.modes.uiEnd === 'named' && (
                                        <FlexBlock>
                                            <AxisEndNamed
                                                label={LABELS.gridItemsControls.tracksPanel.rows.endNamed}
                                                help={LABELS.gridItemsControls.tracksPanel.rows.endNamedHelp}
                                                value={ctrl.row.values.end}
                                                options={ctrl.row.named.lines}
                                                onChange={ctrl.row.handlers.onEndNamed}
                                                hasNamed={ctrl.row.named.hasLines}
                                                mismatchNotice={LABELS.gridItemsControls.tracksPanel.namedLineMismatch}
                                                disabled={ctrl.disabledLines}
                                            />
                                        </FlexBlock>

                                    )}
                                </Flex>
                            </FlexBlock>
                        )}
                    </Flex>
                </FlexBlock>
            </fieldset>
        </Flex >
    );
};