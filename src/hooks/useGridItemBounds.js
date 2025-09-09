import { useMemo } from '@wordpress/element';
import { useParentGridMeta } from '@hooks/useParentGridMeta';

export function useGridItemBounds(attrs) {
    const { columns, rows } = useParentGridMeta();

    const colStartMin = 1;
    const colStartMax = columns || Infinity;
    const rowStartMin = 1;
    const rowStartMax = rows || Infinity;

    const colSpanMax = useMemo(() => {
        const start = Number(attrs.gridColumnStart) || 1;
        if (!columns) return Infinity;
        return Math.max(1, columns - start + 1);
    }, [attrs.gridColumnStart, columns]);

    const rowSpanMax = useMemo(() => {
        const start = Number(attrs.gridRowStart) || 1;
        if (!rows) return Infinity;
        return Math.max(1, rows - start + 1);
    }, [attrs.gridRowStart, rows]);

    //TODO: not a fan of the singular letter names
    const clamped = useMemo(() => {
        const sC  = Math.min(Math.max(Number(attrs.gridColumnStart) || 1, colStartMin), colStartMax || 1);
        const sR  = Math.min(Math.max(Number(attrs.gridRowStart) || 1, rowStartMin), rowStartMax || 1);
        const spC = Math.min(Math.max(Number(attrs.gridColumnSpan) || 1, 1), colSpanMax || 1);
        const spR = Math.min(Math.max(Number(attrs.gridRowSpan) || 1, 1), rowSpanMax || 1);
        return { gridColumnStart: sC, gridColumnSpan: spC, gridRowStart: sR, gridRowSpan: spR };
    }, [attrs.gridColumnStart, attrs.gridColumnSpan, attrs.gridRowStart, attrs.gridRowSpan, colStartMax, rowStartMax, colSpanMax, rowSpanMax]);

    return {
        colStartMin, colStartMax,
        rowStartMin, rowStartMax,
        colSpanMin: 1, colSpanMax,
        rowSpanMin: 1, rowSpanMax,
        clamped,
    };
}