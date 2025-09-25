import { useAttrSetter } from '@hooks/useAttrSetter';
import { useCallback } from '@wordpress/element';

export function useGridItemWriter(clientId) {
    const { set, setMany, unset } = useAttrSetter(clientId);

    const setArea = useCallback((area) => {
        if (!area || typeof area !== 'string') { unset('gridArea'); return; }
        set('gridArea', area.trim());
    }, [set, unset]);

    const setTracks = useCallback((rowStart, rowEnd, colStart, colEnd) => {
        const patch = {};

        if (rowStart !== undefined) patch.gridRowStart = rowStart || undefined;
        if (rowEnd !== undefined) patch.gridRowEnd = rowEnd || undefined;
        if (colStart !== undefined) patch.gridColumnStart = colStart || undefined;
        if (colEnd !== undefined) patch.gridColumnEnd = colEnd || undefined;

        setMany(patch);
    }, [setMany]);

    return { setArea, setTracks, set, setMany, unset };
}