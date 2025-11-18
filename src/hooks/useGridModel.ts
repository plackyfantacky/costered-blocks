// src/hooks/useGridModel.ts

import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';

import type { Breakpoint, BlockAttributes } from "@types";
import { selectActiveBreakpoint } from '@stores/activeBreakpoint';
import { decodeAxis, measureAreas, measureTrackCount } from "@utils/gridUtils";
import { augmentAttributes } from '@utils/breakpointUtils';

type AxisMode = 'simple' | 'tracks' | 'raw';

type AxisDecoded = {
    mode: AxisMode;
    template: string | null;
    normalised: string;
    simple?: { count: number, unit: string };
    tracks?: string[];
    count: number;
};

type AreasMeta = {
    template: string;
    hasAreas: boolean;
    cols: number;    
    rows: number;
};

type GridModel = {
    columns: AxisDecoded;
    rows: AxisDecoded;
    areas: AreasMeta;
    activePane: { columns: AxisMode; rows: AxisMode };
};

export function useGridModel(clientId: string): GridModel | undefined {

    const rawAttributes = useSelect((select: any) => {
        if (!clientId) return undefined as BlockAttributes | undefined;
        const blockEditor = select(blockEditorStore);
        const block = blockEditor.getBlock(clientId);
        return (block?.attributes ?? undefined) as BlockAttributes | undefined;
    }, [clientId]);

    const activeBreakpoint = useSelect(selectActiveBreakpoint, []) as Breakpoint | undefined;
    
    const attributes = useMemo(
        () => (rawAttributes && activeBreakpoint
            ? augmentAttributes(rawAttributes, activeBreakpoint)
            : undefined),
        [rawAttributes, activeBreakpoint]
    );

    if (!attributes) return undefined;

    const read = (key: string): string => String(attributes.$get(key) ?? '');

    return useMemo<GridModel>(() => {
        const gridTemplateColumns = read('gridTemplateColumns');
        const gridTemplateRows = read('gridTemplateRows');
        const gridTemplateAreas = read('gridTemplateAreas');

        const colsDecoded = decodeAxis(gridTemplateColumns);
        const rowsDecoded = decodeAxis(gridTemplateRows);

        const colsCount = measureTrackCount(gridTemplateColumns);
        const rowsCount = measureTrackCount(gridTemplateRows);

        const columns: AxisDecoded = {
            ...colsDecoded,
            count: colsCount,
        };

        const rows: AxisDecoded = {
            ...rowsDecoded,
            count: rowsCount,
        };

        const areasMeasure = measureAreas(gridTemplateAreas);
        const areas: AreasMeta = {
            template: gridTemplateAreas || '',
            hasAreas: areasMeasure.hasAreas,
            cols: areasMeasure.cols,
            rows: areasMeasure.rows
        };

        return {columns, rows, areas, activePane: { columns: columns.mode, rows: rows.mode }}
    }, [
        attributes.$get,
        attributes.costered,
        activeBreakpoint
    ]);
} 