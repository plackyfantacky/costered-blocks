import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useMemo, useCallback } from '@wordpress/element';

import type { Breakpoint, BlockAttributes } from '@types';

import { REDUX_STORE_KEY as BP_STORE } from '@config';
import { augmentAttributes } from '@utils/breakpointUtils';

/**
 * Options supported by the augmented attribute reader.
 */
export type GetterOptions = {
    breakpoint?: Breakpoint;
    resolve?: boolean;
    //allow adding more options in the future
    [key: string]: unknown
}

/**
 * Shape returned by `augmentAttributes`. Only the bits we use are typed.
*/
export interface AugmentedAttributes {
    /* read single value by key */
    $get: <Value = unknown>(key: string, options?: GetterOptions) => Value | undefined;
    /** original raw attrs (should be rare) */
    raw?: Record<string, unknown>;
    /** Current breakpoint context baked into augmentation. */
    breakpoint?: Breakpoint;
}

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
        <Value = unknown>(key: string, options?: GetterOptions) => {
            if (!attributes?.$get) return undefined;
            return attributes.$get<Value>(key, options);
        },
        [attributes]
    );

    const getMany = useCallback(
        <KeyList extends readonly string[], Value = unknown>(
            keyList: KeyList,
            options?: GetterOptions
        ): { [K in KeyList[number]]: Value | undefined } => {
            const result = {} as { [K in KeyList[number]]: Value | undefined };
            if (!attributes?.$get) {
                for (let i = 0; i < keyList.length; i++) result[keyList[i] as KeyList[number]] = undefined;
                return result;
            }
            for (let i = 0; i < keyList.length; i++) {
                const key = keyList[i] as KeyList[number];
                result[key] = attributes.$get<Value>(key, options);
            }
            return result;
        },
        [attributes]
    );

    return useMemo(() => ({ get, getMany, bp: breakpoint, attributes }), [get, getMany, breakpoint, attributes]);
}