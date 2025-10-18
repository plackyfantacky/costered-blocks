import { useCallback } from '@wordpress/element';
import { Notice, Flex, FlexBlock } from '@wordpress/components';

import { LABELS } from '@labels';
import {
    useAttrSetter,
    useParentGridMeta,
    useGridItemTracksController,
    useScopedKey,
    useUIPreferences
} from '@hooks';
import { isIntToken, toInt } from "@utils/gridPlacement";

import {
    AxisStartNumber,
    AxisStartNamed,
    AxisSpan,
    AxisEndNumber,
    AxisEndNamed
} from '@components/composite/GridItemControls';

import CustomToggleGroup from '@components/CustomToggleGroup';
import { CustomSelectControl as SelectControl } from '@components/CustomSelectControl';

type StartMode = 'number' | 'named';
type EndMode = 'auto' | 'number' | 'named';

type Ctrl = ReturnType<typeof useGridItemTracksController> | null;
type EndChangeMode = 'span' | 'end';

type Props = {
    clientId: string | null;
    safeBlockName?: string;
};

export function GridItemTracks({
    clientId,
    safeBlockName }
: Props) {
    if (!clientId) return null;

    const { setMany } = useAttrSetter(clientId);
    const parentMeta = useParentGridMeta(clientId);

    const ctrl = useGridItemTracksController({ clientId, setMany, parentMeta }) as Ctrl;
    if (!ctrl) return null;

    const gridColStartModeKey = useScopedKey('gridColStartMode', { blockName: safeBlockName ?? null });
    const gridColEndModeKey = useScopedKey('gridColEndMode', { blockName: safeBlockName ?? null });
    const [gridColStartMode, setGridColStartMode] = useUIPreferences<StartMode>(gridColStartModeKey, 'number');
    const [gridColEndMode, setGridColEndMode] = useUIPreferences<EndMode>(gridColEndModeKey, 'number');

    const gridRowStartModeKey = useScopedKey('gridRowStartMode', { blockName: safeBlockName ?? null });
    const gridRowEndModeKey = useScopedKey('gridRowEndMode', { blockName: safeBlockName ?? null });
    const [gridRowStartMode, setGridRowStartMode] = useUIPreferences<StartMode>(gridRowStartModeKey, 'number');
    const [gridRowEndMode, setGridRowEndMode] = useUIPreferences<EndMode>(gridRowEndModeKey, 'number');

    /* ----- Mode change helpers ----- */

    const isEndMode = (value: string): value is EndChangeMode => value === 'span' || value === 'end';


    const onColModeChange = (next: string) => {
        if (isEndMode(next)) ctrl.column.setMode(next);
    };

    const onRowModeChange = (next: string) => {
        if (isEndMode(next)) ctrl.row.setMode(next);
    }

    /* ----- Column Mode Switchers ----- */

    const onColStartChangeMode = useCallback((mode: StartMode | string) => {
        const nextMode = (mode as StartMode);
        const { start: colStart } = ctrl.column.values;
        const { onStartNumber, onStartNamed } = ctrl.column.handlers;
        const { hasLines, lines } = ctrl.column.named;

        if (nextMode === 'number') {
            const fallback = isIntToken(colStart) ? toInt(colStart, 1) : 1;
            onStartNumber(fallback);
        } else {
            if (hasLines) {
                const fallback = (!isIntToken(colStart) && colStart) ? String(colStart) : (lines[0] ?? '');
                onStartNamed(fallback);
            } else {
                onStartNumber(1);
            }
        }
        setGridColStartMode(nextMode);
    }, [ctrl.column.values, ctrl.column.named, ctrl.column.handlers, setGridColStartMode]);

    const onColEndChangeMode = useCallback((mode: EndMode | string) => {
        const nextMode = (mode as EndMode);
        const { end: colEnd, start: colStart } = ctrl.column.values;
        const { onEndAuto, onEndNumber, onEndNamed } = ctrl.column.handlers;
        const { hasLines, lines } = ctrl.column.named;

        if (nextMode === 'auto') { 
            onEndAuto(); return; 
        } else if (nextMode === 'number') {
            const fallback = isIntToken(colEnd) 
                ? toInt(colEnd, 1) 
                : (isIntToken(colStart) ? toInt(colStart, 1) : 1);
            onEndNumber(fallback);
        } else {
            if (hasLines) {
                const fallback = 
                    (!isIntToken(colEnd) && colEnd !== 'auto' && colEnd) 
                    ? String(colEnd) 
                    : (lines[0] ?? '');
                onEndNamed(fallback);
            } else {
                onEndNumber(1);
            }
        }
        setGridColEndMode(nextMode);
    }, [ctrl.column.values, ctrl.column.named, ctrl.column.handlers]);

    /* ----- Row Mode Switchers ----- */

    const onRowStartChangeMode = useCallback((mode: StartMode | string) => {
        const nextMode = (mode as StartMode);
        const { start: rowStart } = ctrl.row.values;
        const { onStartNumber, onStartNamed } = ctrl.row.handlers;
        const { hasLines, lines } = ctrl.row.named;

        if (nextMode === 'number') {
            const fallback = isIntToken(rowStart) ? toInt(rowStart, 1) : 1;
            onStartNumber(fallback);
        } else {
            if (hasLines) {
                const fallback = (!isIntToken(rowStart) && rowStart) ? String(rowStart) : (lines[0] ?? '');
                onStartNamed(fallback);
            } else {
                onStartNumber(1);
            }
        }
    }, [ctrl.row.values, ctrl.row.named, ctrl.row.handlers]);

    const onRowEndChangeMode = useCallback((mode: EndMode | string) => {
        const nextMode = (mode as EndMode);
        const { end: rowEnd, start: rowStart } = ctrl.row.values;
        const { onEndAuto, onEndNumber, onEndNamed } = ctrl.row.handlers;
        const { hasLines, lines } = ctrl.row.named;

        if (nextMode === 'auto') { 
            onEndAuto();
        } else if (nextMode === 'number') {
            const fallback = isIntToken(rowEnd) 
                ? toInt(rowEnd, 1)
                : (isIntToken(rowStart) ? toInt(rowStart, 1) : 1);
            onEndNumber(fallback);
        } else {
            if (hasLines) {
                const fallback = 
                    (!isIntToken(rowEnd) && rowEnd !== 'auto' && rowEnd) 
                        ? String(rowEnd)
                        : (lines[0] ?? '');
                onEndNamed(fallback);
            } else {
                onEndNumber(1);
            }
        }
    }, [ctrl.row.values, ctrl.row.named, ctrl.row.handlers]);

    return (
        <Flex direction="column" gap={4} className="costered-blocks-grid-item-tracks--panel">
            {ctrl.hasArea && (
                <Notice status="info" isDismissible={false}>
                    {LABELS.gridItemsControls.tracksPanel.hasAreasNotice}
                </Notice>
            )}
            {/* Columns placement */}
            <fieldset className="costered-blocks--fieldset costered-blocks--griditems-tracks-controls--columns">
                <legend>{LABELS.gridItemsControls.tracksPanel.columns.legend}</legend>
                <FlexBlock className={'costered-blocks--griditems-tracks-controls--column-placement'}>
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
                                onChange={onColModeChange}
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
                                    label={LABELS.gridItemsControls.tracksPanel.columns.spanNumber}
                                    help={LABELS.gridItemsControls.tracksPanel.columns.spanNumberHelp}
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
                                            label={LABELS.gridItemsControls.tracksPanel.columns.trackEndMode}
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
                                onChange={onRowModeChange}
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
                                    label={LABELS.gridItemsControls.tracksPanel.rows.spanNumber}
                                    help={LABELS.gridItemsControls.tracksPanel.rows.spanNumberHelp}
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
                                            label={LABELS.gridItemsControls.tracksPanel.rows.trackEndMode}
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