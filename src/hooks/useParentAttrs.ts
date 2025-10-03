import { useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

import type { Breakpoint, BlockAttributes, CSSPrimitive } from '@types';
import { selectActiveBreakpoint } from '@stores/activeBreakpoint';
import { augmentAttributes } from '@utils/breakpointUtils';
import { MIRRORED_STYLE_KEYS } from '@config';

type Options = {
    keys?: readonly string[];
}

export function useParentAttrs(passedClientId: string, options: Options = {}) {
    const keys = options.keys ?? Array.from(MIRRORED_STYLE_KEYS);

    // Find the parent block
    const { parentId, parentBlock } = useSelect((select: any) => {
        const blockEditor = select('core/block-editor');
        const selectedId: string = passedClientId || blockEditor?.getSelectedBlockClientId?.();
        if (!selectedId) return { parentId: null, parentBlock: null };
        
        const pid: string = blockEditor?.getBlockRootClientId?.(selectedId) ?? null;
        if (!pid) return { parentId: null, parentBlock: null };

        return { parentId: pid, parentBlock: blockEditor?.getBlock?.(pid) || null };
    }, []);

    const activeBreakpoint = useSelect(selectActiveBreakpoint, []) as Breakpoint | undefined;

    const parentAugmented = useMemo(() => {
        const attrs = parentBlock?.attributes as BlockAttributes | undefined;
        return attrs && activeBreakpoint ? augmentAttributes(attrs, activeBreakpoint) : null;
    }, [parentBlock, activeBreakpoint]);

    const parentAttrs = useMemo(() => {
        if (!parentBlock || !parentAugmented) return null;
        
        const output: Record<string, CSSPrimitive | undefined> = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]!;
            output[key] = parentAugmented.$get(key, { cascade: true });
        }
        return output;
        
    }, [parentBlock, parentAugmented, keys]);

    return { parentId, parentAttrs, parentBlock, parentAugmented };
}