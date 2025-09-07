import { useMemo, useState, useCallback, useEffect } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Flex, FlexBlock, FlexItem, RangeControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { makeRepeat, normaliseTemplate } from '@utils/gridPanelUtils';
import UnitControlInput from '@components/UnitControlInput';
import { AxisAside } from "@components/composite/GridAxisControls/AxisAside";
import { useAttrSetter, useGridModel } from '@hooks';
import { DEFAULT_GRID_UNIT } from '@config';

const EMPTY_AXIS = {
    mode: 'raw',
    template: null,
    normalised: '',
    simple: null,
    tracks: null
};

export function GridPanelSimple({ clientId }) {
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

    const colsActive = !!col.template && normaliseTemplate(colsNow) === colKey;
    const rowsActive = !!row.template && normaliseTemplate(rowsNow) === rowKey;

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

    return (
        <Flex direction="column" gap={4}>
            <FlexBlock>
                {__('In Simple mode, you can define the number of columns. All columns equally divide the total available width.', 'costered-blocks')}
            </FlexBlock>
            <FlexBlock>
                <Flex direction="column" gap={1}>
                    <FlexItem>
                        <Flex direction="row" gap={2} justify="space-between" align="center">
                            <FlexBlock>
                                <span className="costered-blocks--grid-panel-simple-label">{__('Columns', 'costered-blocks')}</span>
                            </FlexBlock>
                            <FlexItem style={{ width: 32, flex: '0 0 32px' }}>
                                <AxisAside
                                    axis="columns"
                                    canClear={!!col?.template}
                                    onClear={clearCols}
                                    owner={model.activePane.columns}
                                    here="simple"
                                />
                            </FlexItem>
                        </Flex>
                    </FlexItem>
                    <FlexBlock>
                        <RangeControl
                            min={0}
                            max={12}
                            step={1}
                            value={colCount}
                            onChange={handleColCount}
                            className="costered-blocks--grid-columns-simple-control"
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </FlexBlock>
                    <FlexBlock>
                        <ToggleControl
                            label={__(`Use ${DEFAULT_GRID_UNIT}`, 'costered-blocks')}
                            checked={colUseDGU}
                            onChange={handleColUseDGU}
                            __nextHasNoMarginBottom
                        />
                    </FlexBlock>
                    {!colUseDGU && (
                        <FlexBlock>
                            <UnitControlInput
                                label={__('Unit', 'costered-blocks')}
                                value={colUnit}
                                onChange={handleColUnit}
                            />
                        </FlexBlock>
                    )}
                </Flex>
            </FlexBlock>
            <FlexBlock>
                <Flex direction="column" gap={1}>
                    <Flex direction="row" gap={2} justify="space-between" align="center">
                        <FlexBlock>
                            <span className="costered-blocks--grid-panel-simple-label">{__('Rows', 'costered-blocks')}</span>
                        </FlexBlock>
                        <FlexItem style={{ width: 32, flex: '0 0 32px' }}>
                            <AxisAside
                                axis="rows"
                                canClear={!!row.template}
                                onClear={clearRows}
                                owner={model.activePane.rows}
                                here="tracks"
                            />
                        </FlexItem>
                    </Flex>
                    <FlexBlock>
                        <RangeControl
                            min={0}
                            max={12}
                            step={1}
                            value={rowCount}
                            onChange={handleRowCount}
                            className="costered-blocks--grid-rows-simple-control"
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </FlexBlock>
                    <FlexBlock>
                        <ToggleControl
                            label={__(`Use ${DEFAULT_GRID_UNIT}`, 'costered-blocks')}
                            checked={rowUseDGU}
                            onChange={handleRowUseDGU}
                            __nextHasNoMarginBottom
                        />
                    </FlexBlock>
                    {!rowUseDGU && (
                        <FlexBlock>
                            <UnitControlInput
                                label={__('Unit', 'costered-blocks')}
                                value={rowUnit}
                                onChange={handleRowUnit}
                            />
                        </FlexBlock>
                    )}
                </Flex>
            </FlexBlock>
        </Flex>
    );
} 