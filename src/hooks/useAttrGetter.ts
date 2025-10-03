// src/hooks/useAttrGetter.ts
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useMemo, useCallback } from '@wordpress/element';

import type { Breakpoint, BlockAttributes, CSSPrimitive, CascadeOptions, AugmentedAttributes } from '@types';
import { REDUX_STORE_KEY as BP_STORE } from '@config';
import { augmentAttributes } from '@utils/breakpointUtils';


type AttributesMap = Record<string, unknown>;

export function useAttrGetter(clientId: string) {
    const breakpoint = useSelect(
        (select: any) => select(BP_STORE)?.getBreakpoint?.() || ('desktop' as Breakpoint),
        []
    ) as Breakpoint;

    const rawAttributes = useSelect((select: any) => {
        if (!clientId) return undefined as AttributesMap | undefined;
        const blockEditor = select(blockEditorStore);
        return blockEditor?.getBlockAttributes?.(clientId) as AttributesMap | undefined;
    }, [clientId]);

    const attributes = useMemo<AugmentedAttributes | undefined>(
        () => (rawAttributes ? augmentAttributes(rawAttributes as BlockAttributes, breakpoint) : undefined),
        [rawAttributes, breakpoint]
    );

    const get = useCallback(
        (key: string, options?: CascadeOptions) => {
            if (!attributes?.$get) return undefined;
            return attributes.$get(key, options);
        },
        [attributes]
    );

    const getAs = useCallback(
        <Value = CSSPrimitive>(key: string, options?: CascadeOptions): Value | undefined => 
            (attributes?.$get ? (attributes.$get(key, options) as unknown as Value | undefined) : undefined),
        [attributes]
    );

    const getMany = useCallback(
        (keys: readonly string[], options?: CascadeOptions): Record<string, CSSPrimitive | undefined> => {
            if(!attributes?.$getMany) {
                return Object.fromEntries(keys.map((key) => [key, undefined] )) as Record<string, CSSPrimitive | undefined>;
            }
            return attributes.$getMany([...keys], options);
        },
        [attributes]
    );

    return useMemo(
        () => ({ get, getAs, getMany, bp: breakpoint, attributes }),
        [get, getAs, getMany, breakpoint, attributes]
    );
}