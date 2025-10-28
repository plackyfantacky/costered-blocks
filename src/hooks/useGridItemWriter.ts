import { useCallback } from '@wordpress/element';

import { useAttrSetter } from '@hooks/useAttrSetter';
import { composePlacementAdvanced } from "@utils/gridPlacement";

type Mode = 'span' | 'end';
type Payload = { start?: unknown; span?: unknown; end?: unknown };

export function useGridItemWriter(clientId: string) {
    const { set, setMany, unset } = useAttrSetter(clientId);

    //grid-area
    const setArea = useCallback((area: unknown) => {
        const value = typeof area === 'string' ? area.trim() : '';
        if (!value) { unset('gridArea'); return; }
        set('gridArea', value);
    }, [set, unset]);

    //long-form grid-column / grid-row
    const setTracks = useCallback((
        rowStart: unknown,
        rowEnd: unknown,
        colStart: unknown,
        colEnd: unknown
    ) => {
        const patch: Record<string, unknown> = {};

        if (rowStart !== undefined) patch.gridRowStart = rowStart || undefined;
        if (rowEnd !== undefined) patch.gridRowEnd = rowEnd || undefined;
        if (colStart !== undefined) patch.gridColumnStart = colStart || undefined;
        if (colEnd !== undefined) patch.gridColumnEnd = colEnd || undefined;

        setMany(patch);
    }, [setMany]);

    //shorthands
    const writeColumn = useCallback((mode: Mode, p: Payload) => {
        const value = mode === 'end'
            ? composePlacementAdvanced('end', { start: p.start as any, end: p.end as any })
            : composePlacementAdvanced('span', { start: p.start as any, span: p.span as any });
        set('gridColumn', value);
    }, [set]);

    const writeRow = useCallback((mode: Mode, p: Payload) => {
        const value = mode === 'end'
            ? composePlacementAdvanced('end', { start: p.start as any, end: p.end as any })
            : composePlacementAdvanced('span', { start: p.start as any, span: p.span as any });
        set('gridRow', value);
    }, [set]);

    return { setArea, setTracks, writeColumn, writeRow, set, setMany, unset };
}