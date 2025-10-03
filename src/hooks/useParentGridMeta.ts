import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';

import type { Breakpoint, BlockAttributes, ParentMeta } from '@types';
import { selectActiveBreakpoint } from '@stores/activeBreakpoint';
import { augmentAttributes } from '@utils/breakpointUtils';
import { countTracks } from "@utils/gridUtils";

export function useParentGridMeta(passedClientId?: string): ParentMeta {
    const { parentId, parentBlock } = useSelect((select: any) => {
        const blockEditor = select('core/block-editor');
    
        const selectedId: string | undefined =
            passedClientId || blockEditor?.getSelectedBlockClientId?.();
        if (!selectedId) return { parentId: null, parentBlock: null };

        const pid: string | null = blockEditor?.getBlockRootClientId?.(selectedId) ?? null;
        if (!pid) return { parentId: null, parentBlock: null };

        const pblock = blockEditor?.getBlock?.(pid) ?? null;
        return { parentId: pid, parentBlock: pblock };
    }, [passedClientId]);

    const breakpoint = useSelect(selectActiveBreakpoint, []) as Breakpoint | undefined;
    
    const parent = useMemo(() => {
        const attrs = parentBlock?.attributes as BlockAttributes | undefined;
        return attrs && breakpoint
            ? augmentAttributes(attrs, breakpoint)
            : null;
    }, [parentBlock, breakpoint]);

    // Read cascaded templates as strings
    const columnTemplate = useMemo(
        () => String(parent?.$get?.('gridTemplateColumns', { cascade: true }) ?? ''),
        [parent, parent?.$bp]
    );
    
    const rowTemplate = useMemo(
        () => String(parent?.$get?.('gridTemplateRows', { cascade: true }) ?? ''),
        [parent, parent?.$bp]
    );

    const areaTemplate = useMemo(
        () => String(parent?.$get?.('gridTemplateAreas', { cascade: true }) ?? ''),
        [parent, parent?.$bp]
    );

    // Track counts from templates
    const columns = useMemo(() => countTracks(columnTemplate).count, [columnTemplate]);
    const rows = useMemo(() => countTracks(rowTemplate).count, [rowTemplate]);

    // Grid detection
    const display = useMemo(
        () => String(parent?.$get?.('display', { cascade: true }) ?? '').trim(),
        [parent, parent?.$bp]
    );

    const isGrid = useMemo(
        () => /^(grid|inline-grid)$/i.test(display),
        [display]
    );

    return {
        parentId,
        parentBlock,
        parent,
        display,
        isGrid,
        columnTemplate,
        rowTemplate,
        areaTemplate,
        columns,
        rows,
    }
}