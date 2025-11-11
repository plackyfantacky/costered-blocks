import { useMemo, useCallback } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

import { useAttrGetter, useAttrSetter } from '@hooks';

type AttributesMap = Record<string, unknown>;

export type BlockAttrsAPI = {
    // raw block attributes (no cascade)
    raw: AttributesMap;
    readRaw<T = unknown>(name: string, fallback: T): T;

    // writes
    set(name: string, value: unknown): void;
    write(patch: Record<string, unknown>): void;

    // pasthroughs
    styles: ReturnType<typeof useAttrGetter>;
};

/**
 * Safely adapts whatever `useAttrSetter` returns:
 * - Pairwise form:  (name, value) => void
 * - Patch form:     (patch: Record<string, unknown>) => void
 * - Object API:     { set(name,value), write?(patch) }
 */
function adaptSetter(setter: unknown) {
    if (typeof setter === 'function' && (setter as Function).length >= 2) {
        const func = setter as (name: string, value: unknown) => void;
        const set = (name: string, value: unknown) => func(name, value);
        const write = (patch: Record<string, unknown>) => {
            for (const [key, value] of Object.entries(patch)) {
                func(key, value);
            }
        };
        return { set, write };
    }

    if (typeof setter === 'function') {
        const func = setter as (patch: Record<string, unknown>) => void;
        const set = (name: string, value: unknown) => func({ [name]: value });
        const write = (patch: Record<string, unknown>) => func(patch);
        return { set, write };
    }

    // object API
    if (setter && typeof setter === 'object') {
        const obj = setter as {
            set?: (name: string, value: unknown) => void;
            write?: (patch: Record<string, unknown>) => void;
        }
        const set = obj.set
            ? (name: string, value: unknown) => obj.set!(name, value)
            : (name: string, value: unknown) => { 
                // fallback to write
                obj.write?.({ [name]: value });
            };
        const write = 
            obj.write ??
            ((patch: Record<string, unknown>) => {
                // fallback: write via set
                for (const [key, value] of Object.entries(patch)) obj.set?.(key, value);
            });
        return { set, write };
    }

    // fallback no-op
    const set = (_name: string, _value: unknown) => {};
    const write = (_patch: Record<string, unknown>) => { };
    return { set, write };
}

/**
 * Normalise getting/setting block attributes so we can use our own hooks in block UIs.
 */
export function useBlockAttrs(clientId: string | null): BlockAttrsAPI {
    const id: string | undefined = clientId ?? undefined;

    const raw = useSelect((select: any) => {
        if (!id) return {} as AttributesMap;
        const blockEditor = select(blockEditorStore);
        return blockEditor?.getBlockAttributes?.(id) as AttributesMap;
    });

    // cascade-aware getter (styles.$get, getString, etc.)
    const styles = useAttrGetter(id ?? null);

    const rawSetter = useAttrSetter(id ?? '') as unknown;
    const { set, write } = useMemo(() => adaptSetter(rawSetter), [rawSetter]);

    const readRaw = useCallback(<T = unknown>(name: string, fallback: T): T => {
        const value = raw[name];
        return (value as T) ?? fallback;
    }, [raw]);

    return useMemo(() => ({
        raw,
        readRaw,
        set,
        write,
        styles,
    }), [raw, readRaw, set, write, styles]);
}

