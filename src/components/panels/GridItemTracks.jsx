import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Notice, Flex, FlexItem, FlexBlock, ComboboxControl } from '@wordpress/components';

import { LABELS } from '@labels';
import { useAttrSetter, useParentGridMeta, useGridItemTracksController } from '@hooks';
import { isIntToken, toInt } from "@utils/gridPlacement";

import { AxisStartNumber, AxisStartNamed, AxisSpan, AxisEndNumber, AxisEndNamed } from '@components/composite/GridItemControls';

import CustomToggleGroup from '@components/CustomToggleGroup';
import { CustomSelectControl as SelectControl } from '@components/CustomSelectControl';

const maxInteger = Number.MAX_SAFE_INTEGER;

export function GridItemTracks({ clientId, attributes }) {
    if (!clientId) return null;

    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const { set } = useAttrSetter(updateBlockAttributes, clientId);
    const parentMeta = useParentGridMeta();

    const ctrl = useGridItemTracksController({ attributes, set, parentMeta });

    const onColEndChangeMode = useCallback((mode) => {
        const { end: colEnd, start: colStart } = ctrl.column.values;
        const { onColEndAuto, onColEndNumber, onColEndNamed } = ctrl.handlers;
        const { hasNamedColLines, namedColLines } = ctrl.column.named;

        if (mode === 'auto') { onColEndAuto(); return; }
        if (mode === 'number') {
            const fallback = isIntToken(colEnd) ? toInt(colEnd, 1) : (isIntToken(colStart) ? toInt(colStart, 1) : 1);
            onColEndNumber(fallback);
            return;
        }
        if (mode === 'named') {
            if (hasNamedColLines) {
                const fallback = (!isIntToken(colEnd) && colEnd !== 'auto' && colEnd) || namedColLines[0] || '';
                onColEndNamed(fallback);
            } else {
                onColEndNumber(1);
            }
        }
    }, [ctrl.column.values, ctrl.column.named, ctrl.handlers]);

    return (
        <Flex direction="column" gap={4} className="costered-blocks-grid-item-tracks--panel">
            {ctrl.hasArea && (
                <Notice status="info" isDismissible={false}>
                    {LABELS.gridItemsControls.tracksPanel.hasAreasNotice}
                </Notice>
            )}
            {/* Columns placement */}
            <FlexBlock className={'costered-blocks-grid-item-tracks-controls--column-placement'}>
                <Flex direction="column" gap={4}>
                    {/* Start mode selector: hide entirely if no names */}
                    {ctrl.column.named.hasLines && (
                        <FlexBlock>
                            <SelectControl
                                label={LABELS.gridItemsControls.tracksPanel.columns.trackStartMode}
                                value={ctrl.column.modes.uiStart}
                                onChange={(m) => {
                                    // just flip control rendering; value persists as-is
                                    // no-op, since we infer mode from token; user will type/select accordingly
                                }}
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
                                onChange={ctrl.column.handlers.onColStartNumber}
                                disabled={ctrl.disabledLines}
                            />
                        </FlexBlock>
                    ) : (
                        <FlexBlock>
                            <AxisStartNamed
                                label={LABELS.gridItemsControls.tracksPanel.columns.startNamed}
                                help={LABELS.gridItemsControls.tracksPanel.columns.startNamedHelp}
                                value={ctrl.column.parsed.start}
                                options={ctrl.column.named.lines}
                                onChange={ctrl.column.handlers.onColStartNamed}
                                disabled={ctrl.disabledLines}
                            />
                        </FlexBlock>
                    )}
                    {/* heads-up if value is named but parent has no names */}
                    {ctrl.column.named.hasLines && !isIntToken(ctrl.column.values.start) && ctrl.column.values.start && (
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
                                onChange={ctrl.column.handlers.onColSpan}
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
                                        value={ctrl.column.modes.uiEnd}
                                        onChange={(mode) => onColEndChangeMode(mode)} // this handler is locally defined
                                        disabled={ctrl.disabledLines}
                                    >
                                        <SelectControl.Option value="auto">{LABELS.gridItemsControls.tracksPanel.columns.endAuto}</SelectControl.Option>
                                        <SelectControl.Option value="number">{LABELS.gridItemsControls.tracksPanel.columns.endNumber}</SelectControl.Option>
                                        {hasNamedColLines && (
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
                                            onChange={ctrl.column.handlers.onColEndNumber}
                                            disabled={ctrl.disabledLines}
                                            zeroNotice={LABELS.gridItemsControls.tracksPanel.endNumberZeroHelp}
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
                                            onChange={ctrl.column.handlers.onColEndNamed}
                                            hasNamed={ctrl.column.named.hasLines}
                                            mismatchNotice={LABELS.gridItemsControls.columnEndNameMismatch}
                                            disabled={ctrl.disabledLines}
                                        />
                                    </FlexBlock>
                                    
                                )}
                            </Flex>
                        </FlexBlock>
                    )}
                </Flex>
            </FlexBlock>
        </Flex >
    );
};