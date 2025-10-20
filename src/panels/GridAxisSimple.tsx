import type { ComponentProps } from "react";
import { useMemo, useState, useCallback, useEffect } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Flex, FlexBlock, RangeControl, ToggleControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';

import { useAttrSetter, useGridModel, useUnsavedAttr } from '@hooks';
import { DEFAULT_GRID_UNIT } from '@config';
import { LABELS } from '@labels';
import { getBlockCosteredId } from '@utils/blockUtils';
import { makeRepeat } from '@utils/gridUtils';

import UnitControlInput from '@components/UnitControlInput';
import CustomNotice from "@components/CustomNotice";
import { GridAxisAside } from "@components/composite/GridAxisAside";
import type { GridAxisDisabled } from '@types';

const EMPTY_AXIS = {
    mode: 'raw' as const,
    template: null as string | null,
    normalised: '' as string,
    simple: null as { count: number; unit: string } | null,
    tracks: null as unknown
};

type UnitOnChange = ComponentProps<typeof UnitControlInput>['onChange'];


type Props = {
    clientId: string | null;
    axisDisabled: GridAxisDisabled;
};

export function GridAxisSimple({
    clientId,
    axisDisabled
 }: Props) {
    if (!clientId) return null;

    const { set, unset } = useAttrSetter(clientId ?? null);

    const costeredId = getBlockCosteredId(clientId);
    const unsavedCols = useUnsavedAttr(costeredId, 'gridTemplateColumns', 'simple');
    const unsavedRows = useUnsavedAttr(costeredId, 'gridTemplateRows', 'simple');

    // Always have a safe model shape
    const model = (useGridModel(clientId) as any) || {};
    const col = (model.columns ?? EMPTY_AXIS) as typeof EMPTY_AXIS;
    const row = (model.rows ?? EMPTY_AXIS) as typeof EMPTY_AXIS;

    // Seed from model (if unknown/raw, fall back to zeros + 1fr)
    const [colCount, setColCount] = useState<number>(col.simple?.count ?? 0);
    const [colUnit, setColUnit] = useState<string>(col.simple?.unit ?? DEFAULT_GRID_UNIT);
    const [colUseDGU, setColUseDGU] = useState<boolean>((col.simple?.unit ?? DEFAULT_GRID_UNIT) === DEFAULT_GRID_UNIT);

    const [rowCount, setRowCount] = useState<number>(row.simple?.count ?? 0);
    const [rowUnit, setRowUnit] = useState<string>(row.simple?.unit ?? DEFAULT_GRID_UNIT);
    const [rowUseDGU, setRowUseDGU] = useState<boolean>((row.simple?.unit ?? DEFAULT_GRID_UNIT) === DEFAULT_GRID_UNIT);

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
        () => (colUseDGU ? DEFAULT_GRID_UNIT : colUnit || DEFAULT_GRID_UNIT),
        [colUseDGU, colUnit]
    );
    const effectiveRowUnit = useMemo(
        () => (rowUseDGU ? DEFAULT_GRID_UNIT : rowUnit || DEFAULT_GRID_UNIT),
        [rowUseDGU, rowUnit]
    );

    // Active if our current serialize equals canonical template
    const colsNow = makeRepeat(colCount, effectiveColUnit);
    const rowsNow = makeRepeat(rowCount, effectiveRowUnit);

    //const colsActive = !!col.template && normaliseTemplate(colsNow) === colKey;
    //const rowsActive = !!row.template && normaliseTemplate(rowsNow) === rowKey;

    const writeCols = useCallback((nextCount: number, nextUnit: string) => {
        const template = makeRepeat(nextCount, nextUnit);
        template == null ? unset('gridTemplateColumns') : set('gridTemplateColumns', template);
        unsavedCols.setUnsaved(!!template);
    }, [set, unset]);


    const writeRows = useCallback((nextCount: number, nextUnit: string) => {
        const template = makeRepeat(nextCount, nextUnit);
        template == null ? unset('gridTemplateRows') : set('gridTemplateRows', template);
        unsavedRows.setUnsaved(!!template);
    }, [set, unset]);


    /* handlers: update local state, then write immediately */

    const handleColCount = useCallback((num: number | undefined) => {
        const next = typeof num === 'number' ? num : parseInt(num || '0', 10);
        setColCount(next);
        writeCols(next, colUseDGU ? DEFAULT_GRID_UNIT : colUnit);
    }, [colUseDGU, colUnit, writeCols]);

    const handleRowCount = useCallback((num: number | undefined) => {
        const next = typeof num === 'number' ? num : parseInt(num || '0', 10);
        setRowCount(next);
        writeRows(next, rowUseDGU ? DEFAULT_GRID_UNIT : rowUnit);
    }, [rowUseDGU, rowUnit, writeRows]);

    const handleColUseDGU = useCallback((useDGU: boolean) => {
        setColUseDGU(useDGU);
        const unit = useDGU ? DEFAULT_GRID_UNIT : (colUnit || DEFAULT_GRID_UNIT);
        if (!useDGU && !colUnit) setColUnit(unit);
        writeCols(colCount, unit);
    }, [colCount, colUnit, writeCols]);

    const handleRowUseDGU = useCallback((useDGU: boolean) => {
        setRowUseDGU(useDGU);
        const unit = useDGU ? DEFAULT_GRID_UNIT : (rowUnit || DEFAULT_GRID_UNIT);
        if (!useDGU && !rowUnit) setRowUnit(unit);
        writeRows(rowCount, unit);
    }, [rowCount, rowUnit, writeRows]);

    const handleColUnit: UnitOnChange = (unit) => {
        const u = typeof unit === 'number' ? String(unit) : (unit ?? '').trim();
        setColUnit(u);
        writeCols(colCount, colUseDGU ? DEFAULT_GRID_UNIT : (u || DEFAULT_GRID_UNIT));
    }
    
    const handleRowUnit: UnitOnChange = (unit) => {
        const u = typeof unit === 'number' ? String(unit) : (unit ?? '').trim();
        setRowUnit(u);
        writeRows(rowCount, rowUseDGU ? DEFAULT_GRID_UNIT : (u || DEFAULT_GRID_UNIT));
    };
    
    const clearCols = useCallback(() => {
        setColCount(0);
        unset('gridTemplateColumns');
    }, [unset]);

    const clearRows = useCallback(() => {
        setRowCount(0);
        unset('gridTemplateRows');
    }, [unset]);

    const colDisabled = !!axisDisabled?.columns;
    const rowDisabled = !!axisDisabled?.rows;

    return (
        <Flex direction="column" gap={4}>
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
            <fieldset className="costered-blocks--fieldset costered-blocks--grid-panel-simple--axis-controls">
                <legend>{LABELS.gridControls.simplePanel.columns}</legend>
                <Flex direction="column" gap={4} className={"costered-blocks--grid-panel-simple--axis-controls-inner"}>
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
                        __next40pxDefaultSize
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
            </fieldset>
            {rowDisabled && (
                <FlexBlock>
                    <CustomNotice
                        type="info"
                        title={LABELS.gridControls.simplePanel.rowIsDisabled}
                        content={LABELS.gridControls.simplePanel.rowIsDisabledHelp}
                    />
                </FlexBlock>
            )}
            <fieldset className="costered-blocks--fieldset costered-blocks--grid-panel-simple--axis-controls">
                <legend>{LABELS.gridControls.simplePanel.rows}</legend>
                <Flex direction="column" gap={4} className={"costered-blocks--grid-panel-simple--axis-controls-inner"}>
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
                        __next40pxDefaultSize
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
            </fieldset>
        </Flex> 
    );
} 