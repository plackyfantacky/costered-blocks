import { useMemo, useState, useCallback, useEffect } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Flex, FlexBlock, RangeControl, ToggleControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';

import { useAttrSetter, useGridModel } from '@hooks';
import { DEFAULT_GRID_UNIT } from '@config';
import { LABELS } from '@labels';
import { makeRepeat } from '@utils/gridUtils';

import UnitControlInput from '@components/UnitControlInput';
import CustomNotice from "@components/CustomNotice";
import { GridAxisAside } from "@components/composite/GridAxisAside";

const EMPTY_AXIS = {
    mode: 'raw',
    template: null,
    normalised: '',
    simple: null,
    tracks: null
};

export function GridAxisSimple({ clientId, axisDisabled = {} }) {
    if (!clientId) return null;
    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const { set, unset } = useAttrSetter(updateBlockAttributes, clientId);

    // Always have a safe model shape
    const model = useGridModel(clientId) || {};
    const col = model.columns ?? EMPTY_AXIS;
    const row = model.rows ?? EMPTY_AXIS;

    // Seed from model (if unknown/raw, fall back to zeros + 1fr)
    const [colCount, setColCount] = useState(col.simple?.count ?? 0);
    const [colUnit, setColUnit] = useState(col.simple?.unit ?? DEFAULT_GRID_UNIT);
    const [colUseDGU, setColUseDGU] = useState((col.simple?.unit ?? DEFAULT_GRID_UNIT) === DEFAULT_GRID_UNIT);

    const [rowCount, setRowCount] = useState(row.simple?.count ?? 0);
    const [rowUnit, setRowUnit] = useState(row.simple?.unit ?? DEFAULT_GRID_UNIT);
    const [rowUseDGU, setRowUseDGU] = useState((row.simple?.unit ?? DEFAULT_GRID_UNIT) === DEFAULT_GRID_UNIT);

    // Keys to avoid optional chaining in deps
    const colKey = col?.normalised ?? '';
    const rowKey = row?.normalised ?? '';

    // resync Columns UI when attributes change
    useEffect(() => {
        setColCount(col.simple?.count ?? 0);
        setColUnit(col.simple?.unit ?? DEFAULT_GRID_UNIT);
        setColUseDGU((col.simple?.unit ?? DEFAULT_GRID_UNIT) === DEFAULT_GRID_UNIT);
    }, [colKey]); // normalised changes whenever template string changes meaningfully

    useEffect(() => {
        setRowCount(row.simple?.count ?? 0);
        setRowUnit(row.simple?.unit ?? DEFAULT_GRID_UNIT);
        setRowUseDGU((row.simple?.unit ?? DEFAULT_GRID_UNIT) === DEFAULT_GRID_UNIT);
    }, [rowKey]);

    // Effective units (avoid transient empty strings)
    const effectiveColUnit = useMemo(
        () => (colUseDGU ? DEFAULT_GRID_UNIT : (colUnit || DEFAULT_GRID_UNIT)),
        [colUseDGU, colUnit]
    );
    const effectiveRowUnit = useMemo(
        () => (rowUseDGU ? DEFAULT_GRID_UNIT : (rowUnit || DEFAULT_GRID_UNIT)),
        [rowUseDGU, rowUnit]
    );

    // Active if our current serialize equals canonical template
    const colsNow = makeRepeat(colCount, effectiveColUnit);
    const rowsNow = makeRepeat(rowCount, effectiveRowUnit);

    //const colsActive = !!col.template && normaliseTemplate(colsNow) === colKey;
    //const rowsActive = !!row.template && normaliseTemplate(rowsNow) === rowKey;

    const writeCols = useCallback((nextCount, nextUnit) => {
        const template = makeRepeat(nextCount, nextUnit);
        template == null ? unset('gridTemplateColumns') : set('gridTemplateColumns', template);
    }, [set, unset]);


    const writeRows = useCallback((nextCount, nextUnit) => {
        const template = makeRepeat(nextCount, nextUnit);
        template == null ? unset('gridTemplateRows') : set('gridTemplateRows', template);
    }, [set, unset]);


    /* handlers: update local state, then write immediately */

    const handleColCount = useCallback((n) => {
        const next = typeof n === 'number' ? n : parseInt(n || '0', 10);
        setColCount(next);
        writeCols(next, colUseDGU ? DEFAULT_GRID_UNIT : colUnit);
    }, [colUseDGU, colUnit, writeCols]);

    const handleRowCount = useCallback((n) => {
        const next = typeof n === 'number' ? n : parseInt(n || '0', 10);
        setRowCount(next);
        writeRows(next, rowUseDGU ? DEFAULT_GRID_UNIT : rowUnit);
    }, [rowUseDGU, rowUnit, writeRows]);

    const handleColUseDGU = useCallback((useDGU) => {
        setColUseDGU(useDGU);
        const unit = useDGU ? DEFAULT_GRID_UNIT : (colUnit || DEFAULT_GRID_UNIT);
        if (!useDGU && !colUnit) setColUnit(unit);
        writeCols(colCount, unit);
    }, [colCount, colUnit, writeCols]);

    const handleRowUseDGU = useCallback((useDGU) => {
        setRowUseDGU(useDGU);
        const unit = useDGU ? DEFAULT_GRID_UNIT : (rowUnit || DEFAULT_GRID_UNIT);
        if (!useDGU && !rowUnit) setRowUnit(unit);
        writeRows(rowCount, unit);
    }, [rowCount, rowUnit, writeRows]);

    const handleColUnit = useCallback((unit) => {
        const u = (unit || '').trim();
        setColUnit(u);
        writeCols(colCount, colUseDGU ? DEFAULT_GRID_UNIT : (u || DEFAULT_GRID_UNIT));
    }, [colCount, colUseDGU, writeCols]);

    const handleRowUnit = useCallback((unit) => {
        const u = (unit || '').trim();
        setRowUnit(u);
        writeRows(rowCount, rowUseDGU ? DEFAULT_GRID_UNIT : (u || DEFAULT_GRID_UNIT));
    }, [rowCount, rowUseDGU, writeRows]);

    const clearCols = useCallback(() => {
        setColCount(0);
        unset('gridTemplateColumns');
    }, [unset]);

    const clearRows = useCallback(() => {
        setRowCount(0);
        unset('gridTemplateRows');
    }, [unset]);

    const colDisabled = axisDisabled?.columns ?? false;
    const rowDisabled = axisDisabled?.rows ?? false;

    return (
        <Flex direction="column" gap={6}>
            <FlexBlock className="costered-blocks--grid-panel-simple--description">
                {LABELS.gridControls.simplePanel.description}
            </FlexBlock>
            {colDisabled && (
                <FlexBlock>
                    <CustomNotice 
                        type="info"
                        title={LABELS.gridControls.simplePanel.columnIsDisabled}
                        content={LABELS.gridControls.simplePanel.columnIsDisabledHelp}
                    />
                </FlexBlock>
            )}
            <Flex direction="column" gap={3} className={"costered-blocks--grid-panel-simple--axis-controls"}>
                <Flex direction="row" justify="space-between" align="center">
                    <span className="costered-blocks--grid-panel-simple--axis-label">{LABELS.gridControls.simplePanel.columns}</span>
                    <GridAxisAside
                        axis="columns"
                        canClear={!!col?.template}
                        onClear={clearCols}
                        owner={model.activePane.columns}
                        here="simple"
                        label={LABELS.gridControls.simplePanel.columnsClear}
                        disabled={colDisabled}
                    />
                </Flex>
                <RangeControl
                    min={0}
                    max={12}
                    step={1}
                    value={colCount}
                    onChange={handleColCount}
                    disabled={colDisabled}
                    className="costered-blocks--grid-columns-simple--axis-control"
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <ToggleControl
                    label={sprintf(LABELS.gridControls.simplePanel.columnSpan, DEFAULT_GRID_UNIT)}
                    checked={colUseDGU}
                    onChange={handleColUseDGU}
                    disabled={colDisabled}
                    __nextHasNoMarginBottom
                />
                {!colUseDGU && (
                    <UnitControlInput
                        label={LABELS.gridControls.simplePanel.columnUnit}
                        value={colUnit}
                        onChange={handleColUnit}
                        disabled={colDisabled}
                    />
                )}
            </Flex>
            {rowDisabled && (
                <FlexBlock>
                    <CustomNotice
                        type="info"
                        title={LABELS.gridControls.simplePanel.rowIsDisabled}
                        content={LABELS.gridControls.simplePanel.rowIsDisabledHelp}
                    />
                </FlexBlock>
            )}
            <Flex direction="column" gap={2} className={"costered-blocks--grid-panel-simple--axis-controls"}>
                <Flex direction="row" justify="space-between" align="center">
                    <span className="costered-blocks--grid-panel-simple--axis-label">{LABELS.gridControls.simplePanel.rows}</span>
                    <GridAxisAside
                        axis="rows"
                        canClear={!!row.template}
                        onClear={clearRows}
                        owner={model.activePane.rows}
                        here="simple"
                        label={LABELS.gridControls.simplePanel.rowsClear}
                        disabled={rowDisabled}
                    />
                </Flex>
                <RangeControl
                    min={0}
                    max={12}
                    step={1}
                    value={rowCount}
                    onChange={handleRowCount}
                    disabled={rowDisabled}
                    className="costered-blocks--grid-rows-simple--axis-control"
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <ToggleControl
                    label={sprintf(LABELS.gridControls.simplePanel.rowSpan, DEFAULT_GRID_UNIT)}
                    checked={rowUseDGU}
                    onChange={handleRowUseDGU}
                    disabled={rowDisabled}
                    __nextHasNoMarginBottom
                />
                {!rowUseDGU && (
                    <UnitControlInput
                        label={LABELS.gridControls.simplePanel.rowUnit}
                        value={rowUnit}
                        onChange={handleRowUnit}
                        disabled={rowDisabled}
                    />
                )}
            </Flex>
        </Flex>
    );
} 