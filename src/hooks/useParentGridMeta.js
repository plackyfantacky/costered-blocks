import { useMemo } from '@wordpress/element';
import { useParentAttrs, useGridModel } from '@hooks';
import { countTracks, parseAreas, ensureSize } from '@utils/gridUtils';

export function useParentGridMeta(emptyToken = '.') {
    const { parentId } = useParentAttrs();
    const model = useGridModel(parentId);

    const columnTemplate = model?.columns?.template ?? '';
    const rowTemplate    = model?.rows?.template ?? '';
    const areasTemplate  = model?.areas?.template ?? '';

    const columns = useMemo(() => {
        const c = countTracks(columnTemplate).count;
        if (c > 0) return c;
        const parsed = parseAreas(areasTemplate, emptyToken);
        return parsed[0]?.length || 0;
    }, [columnTemplate, areasTemplate, emptyToken]);

    const rows = useMemo(() => {
        const r = countTracks(rowTemplate).count;
        if (r > 0) return r;
        const parsed = parseAreas(areasTemplate, emptyToken);
        return parsed.length || 0;
    }, [rowTemplate, areasTemplate, emptyToken]);

    const matrix = useMemo(() => {
        const parsed = parseAreas(areasTemplate, emptyToken);
        const cols = parsed[0]?.length || columns || 1;
        const rws  = parsed.length || rows || 1;
        return ensureSize(parsed, cols, rws, emptyToken);
    }, [areasTemplate, columns, rows, emptyToken]);

    const areaNames = useMemo(() => {
        const names = new Set();
        for (const row of matrix) {
            for (const cell of row) {
                const v = String(cell || '').trim();
                if (v && v !== emptyToken) names.add(v);
            }
        }
        return Array.from(names);
    }, [matrix, emptyToken]);

    const hasGrid = Boolean(columnTemplate || rowTemplate || areasTemplate);

    return {
        parentId,
        hasGrid,
        columns,
        rows,
        matrix,
        areaNames,
        areasTemplate,
        columnTemplate,
        rowTemplate,
        emptyToken,
    };
    
}