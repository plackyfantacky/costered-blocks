import { useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

import type { Breakpoint, BlockAttributes, CSSPrimitive, CascadeOptions } from '@types';
import { selectActiveBreakpoint } from '@stores/activeBreakpoint';
import { augmentAttributes } from '@utils/breakpointUtils';
import { MIRRORED_STYLE_KEYS } from '@config';

type Options = {
    keys?: readonly string[];
}

type ParentAttrsReturn = {
    parentId: string | null;
    parentAttrs: Record<string, CSSPrimitive | undefined> | null;
    parentBlock: any;
    parentAugmented: (BlockAttributes & { 
        $get: (key: string, options?: CascadeOptions) => CSSPrimitive | undefined
        $getCascade: (key: string) => CSSPrimitive | undefined;
        $getMany: (keys: ReadonlyArray<string>, options?: CascadeOptions) => Record<string, CSSPrimitive | undefined>;
        $bp: Breakpoint;
    }) | null;
}

export function useParentAttrs(passedClientId?: string, options: Options = {}): ParentAttrsReturn {
    const keys = options.keys ?? Array.from(MIRRORED_STYLE_KEYS);

    // Find the parent block
    const { parentId, parentBlock } = useSelect((select: any) => {
        const blockEditor = select('core/block-editor');
        const selectedId: string = passedClientId || blockEditor?.getSelectedBlockClientId?.();

        if (!selectedId) return { parentId: null, parentBlock: null };
        
        const pid: string = blockEditor?.getBlockRootClientId?.(selectedId);
        if (!pid) return { parentId: null, parentBlock: null };

        return { parentId: pid, parentBlock: blockEditor?.getBlock?.(pid) || null };
    }, []);

    const activeBreakpoint = useSelect(selectActiveBreakpoint, []) as Breakpoint | undefined;

    const parentAugmented = useMemo(() => {
        const attrs = parentBlock?.attributes as BlockAttributes | undefined;
        return attrs && activeBreakpoint ? augmentAttributes(attrs, activeBreakpoint) : null;
    }, [parentBlock?.attributes, activeBreakpoint]);

    const parentAttrs = useMemo(() => {
        if (!parentBlock) return null;
        const result: Record<string, CSSPrimitive | undefined> = {};
        for (const key of keys) result[key] = parentAugmented?.$get(key);
        return result;

    }, [parentBlock, parentAugmented, keys]);

    return { parentId, parentAttrs, parentBlock, parentAugmented };
}