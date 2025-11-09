import { useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

import type { Breakpoint, BlockAttributes, CSSPrimitive, CascadeOptions, AugmentedAttributes } from '@types';
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

export function useParentAttrs(
    passedClientId?: string | null,
    options: Options = {}
): ParentAttrsReturn {
    const id: string | undefined = passedClientId ?? undefined;
    const keys = options.keys ?? Array.from(MIRRORED_STYLE_KEYS);

    // Find the parent block
    const { parentId, parentBlock } = useSelect((select: any) => {
        const blockEditor = select('core/block-editor');
        const selectedId: string | undefined = 
            id ?? (blockEditor?.getSelectedBlockClientId?.() ?? undefined);

        if (!selectedId) return { parentId: null, parentBlock: null };
        
        const pid: string | null = blockEditor?.getBlockRootClientId?.(selectedId) ?? null;
        if (!pid) return { parentId: null, parentBlock: null };

        return { 
            parentId: pid, 
            parentBlock: blockEditor?.getBlock?.(pid) || null 
        };
    }, []);

    const activeBreakpoint = useSelect(selectActiveBreakpoint, []) as Breakpoint | undefined;

    const parentAugmented: AugmentedAttributes | null = useMemo(() => {
        const attrs = parentBlock?.attributes as BlockAttributes | undefined;
        return attrs && activeBreakpoint ? augmentAttributes(attrs, activeBreakpoint) : null;
    }, [parentBlock, activeBreakpoint]);

    const parentAttrs = useMemo(() => {
        if (!parentAugmented) return null;
        const output: Record<string, CSSPrimitive | undefined> = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]!;
            output[key] = parentAugmented?.$get(key, { cascade: true });
        }
        return output;

    }, [parentAugmented, keys]);

    return { parentId, parentAttrs, parentBlock, parentAugmented };
}