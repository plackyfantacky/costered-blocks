// src/hooks/useAttrSetter.ts
/**
 * We expose a universal setter for block attributes that works in two contexts:
 *  1) Within a block edit (we only know clientId, we call core/block-editor ourselves)
 *  2) From external UI (we receive a writer function and a clientId)
 *
 * Also normalise values (trim, empty-as-unset, unitless numbers) and write only the changed keys.
 * Ensure our costered shape and a stable costeredId on every write.
 */
import { useCallback, useMemo } from '@wordpress/element';
import { useDispatch, useSelect, select as dataSelect } from '@wordpress/data';

import type { Breakpoint, BlockAttributes, CSSPrimitive, StyleMap } from "@types";
import { getStylesForBreakpoint, withBreakpointStyles } from '@utils/costeredStyles';

import { ensureShape } from '@utils/attributeUtils';
import { seedCosteredId } from '@utils/blockUtils';
import { VERBATIM_STRING_KEYS, UNITLESS } from "@config";
import { selectActiveBreakpoint } from '@stores/activeBreakpoint';

const BP_DESKTOP: Breakpoint = 'desktop';

type AttributesMap = Record<string, unknown>;
type UpdateInput = AttributesMap | ((prev: AttributesMap) => AttributesMap);
type InternalWriter = (input: UpdateInput) => void;

// Writer that matches core/block-editor dispatch signature
type WriterWithClientId = (clientId: string, next: AttributesMap) => void;
// Compat writer some callers might pass (accepts just the attributes object)
type CompatWriter = (next: AttributesMap) => void;

export type SetterOptions = {
    trim?: boolean; //default true
    emptyUnsets?: boolean; //default true
    breakpoint?: Breakpoint; //default active breakpoint
}

type ReturnType = {
    set: (key: string, value: unknown) => void;
    setMany: (partial: Record<string, unknown>) => void;
    unset: (key: string) => void;
    unsetMany: (keys: readonly string[]) => void;
    withPrefix: (prefix: string) => {
        set: (key: string, value: unknown) => void;
        setMany: (partial: Record<string, unknown>) => void;
        unset: (key: string) => void;
        unsetMany: (keys: readonly string[]) => void;
    };
    activeBreakpoint: Breakpoint;
}

/**
 * Overloads (we keep our public API as-is):
 * - useAttrSetter(clientId, options?)
 * - useAttrSetter(writer, clientId, options?)
 * - useAttrSetter(compatWriter, options?)  // already wrapped writer returns (next) => void
 */
export function useAttrSetter(clientId?: string | null, options?: SetterOptions): ReturnType;
export function useAttrSetter(
    writer: (clientId: string, next: AttributesMap) => void, 
    clientId: string | null,
    options?: SetterOptions): ReturnType;
export function useAttrSetter(
    writer: (next: AttributesMap) => void, 
    options?: SetterOptions
): ReturnType;

export function useAttrSetter(
    arg1: string | null | undefined | WriterWithClientId | CompatWriter,
    arg2?: string | null | undefined | SetterOptions,
    maybeOptions: SetterOptions = { trim: true, emptyUnsets: true }
): ReturnType {
    const options: SetterOptions = (typeof arg2 === 'object' ? arg2 : maybeOptions) || {};
    const { trim = true, emptyUnsets = true, breakpoint: forcedBreakpoint } = options;

    const selectedBreakpoint = useSelect(selectActiveBreakpoint, []) as Breakpoint | undefined;
    const activeBreakpoint: Breakpoint = forcedBreakpoint || selectedBreakpoint || BP_DESKTOP;

    const { updateBlockAttributes } = useDispatch('core/block-editor') as {
        updateBlockAttributes: WriterWithClientId;
    };

    const updateFn: InternalWriter = useMemo(() => {
        // called as useAttrSetter(clientId)
        if (typeof arg1 === 'string' || arg1 === null) {
            const clientId = (arg1 as string | null | undefined) ?? undefined;
            return (updaterOrObject: UpdateInput) => {
                if (!clientId) return; // no target, no-op

                if (typeof updaterOrObject === 'function') {
                    const prev = (dataSelect('core/block-editor') as any)?.getBlockAttributes(clientId) || {};
                    const next = (updaterOrObject as (p: AttributesMap) => AttributesMap)(prev) || prev;
                    updateBlockAttributes(clientId, next);
                } else {
                    updateBlockAttributes(clientId, (updaterOrObject as AttributesMap) || {});
                }
            }
        }

        // called as useAttrSetter(updateBlockAttributes, clientId)
        if (typeof arg1 === 'function' && (typeof arg2 === 'string' || arg2 == null)) {
            const writer = arg1 as WriterWithClientId | CompatWriter;
            const clientId = (arg2 as string | null | undefined) ?? undefined;

            return (updaterOrObject: UpdateInput) => {
                if (!clientId) return; // no target, no-op

                if (typeof updaterOrObject === 'function') {
                    const prev = (dataSelect('core/block-editor') as any)?.getBlockAttributes(clientId) || {};
                    const next = (updaterOrObject as (p: AttributesMap) => AttributesMap)(prev) || prev;
                    try {
                        (writer as WriterWithClientId)(clientId, next);
                    } catch {
                        // if a compat writer was passed accidentally, just call it
                        (writer as CompatWriter)(next);
                    }
                    return;
                }

                const payload = (updaterOrObject as AttributesMap) || {};
                try {
                    (writer as WriterWithClientId)(clientId, payload);
                } catch {
                    // if a compat writer was passed accidentally, just call it
                    (writer as CompatWriter)(payload);
                }
            };
        }

        // already a compat function writer `(next) => void`
        if (typeof arg1 === 'function') {
            const compat = arg1 as CompatWriter;
            return (updaterOrObject: UpdateInput) => {
                if (typeof updaterOrObject === 'function') {
                    // Compat mode does not have a clientId to read prev; require a plain object here.
                    // We evaluate the updater against an empty object to keep best-effort behavior.
                    const next = (updaterOrObject as (p: AttributesMap) => AttributesMap)({});
                    compat(next);
                } else {
                    compat(updaterOrObject || {});
                }
            };   
        }

        // fallback - no-op
        return () => {};
    }, [arg1, arg2, updateBlockAttributes]);

    const normalise = useCallback(
        (rawValue: unknown, keyName: string): CSSPrimitive | undefined => {
        //exit early
        if (rawValue === undefined || rawValue === null) return undefined;

        //verbatim strings; only trim and allow empty to truly unset
        if (VERBATIM_STRING_KEYS.has(keyName)) {
            const value = (typeof rawValue === 'string' && trim) ? rawValue.trim() : String(rawValue);
            return emptyUnsets && value === '' ? undefined : value;
        }

        let value: unknown = rawValue;

        //trim only if it's a string
        if (trim && typeof value === 'string') value = value.trim();

        //collapse empty strings to undefined
        if (emptyUnsets && (
            value === '' ||
            value == 'null' ||
            value == 'undefined'
        )) return undefined;

        // for unitless numbers, coerce to number
        if (UNITLESS.has(keyName)) {
            if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) {
                const num = Number(value);
                return Number.isFinite(num) ? num : undefined;
            }
            if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
            //anything else is invalid
            return undefined;
        }

        //final coercion. numbers become numbers, everything else becomes string
        if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;

        if (typeof value === 'string') {
            if (value === 'null' || value === 'undefined') return undefined;
            return value;
        }

        // fallback - try to stringify
        try {
            return String(value);
        } catch {
            return undefined;
        }
    }, [trim, emptyUnsets]);


    /**
     * Set a single attribute in our breakpoint bucket.
     */
    const set = useCallback(
        (keyName: string, input: unknown) => {
            updateFn((prev) => {
                const next = { ...(prev || {}) } as BlockAttributes;

                seedCosteredId(next); // ensure a stable costeredId
                next.costered = ensureShape(next.costered);

                const value = normalise(input, keyName); // only run once
                const currentMap: StyleMap = getStylesForBreakpoint(next, activeBreakpoint);
                const edited: StyleMap = { ...currentMap };
                if (value === undefined) {
                    if (Object.prototype.hasOwnProperty.call(edited, keyName)) {
                        delete edited[keyName];
                    } else {
                        return prev; // nothing to remove, avoid write
                    }
                } else {
                    edited[keyName] = String(value);
                }
                return withBreakpointStyles(next, activeBreakpoint, edited) as unknown as AttributesMap;
            });
    }, [updateFn, activeBreakpoint, normalise]);

    const setMany = useCallback((partial: Record<string, unknown>) => {
        if (!partial || typeof partial !== 'object') return;

        updateFn((prev) => {
            const next = { ...(prev || {}) } as BlockAttributes;

            seedCosteredId(next); // ensure a stable costeredId
            next.costered = ensureShape(next.costered);

            const base: StyleMap = getStylesForBreakpoint(next, activeBreakpoint);
            const edited: StyleMap = { ...base };
            for (const [keyName, input] of Object.entries(partial)) {
                const value = normalise(input, keyName); // only run once per key
                if (value === undefined) {
                    if (Object.prototype.hasOwnProperty.call(edited, keyName)) delete edited[keyName];
                } else {
                    edited[keyName] = String(value);
                }
            }
            return withBreakpointStyles(next, activeBreakpoint, edited) as unknown as AttributesMap;
        });

    }, [updateFn, activeBreakpoint, normalise]);

    const unset = useCallback((keyName: string) => {
        updateFn((prev) => {
            const next = { ...(prev || {}) } as BlockAttributes;

            seedCosteredId(next); // ensure a stable costeredId - we always want a costeredId even if all styles are cleared
            next.costered = ensureShape(next.costered);
            const map: StyleMap = getStylesForBreakpoint(next, activeBreakpoint);

            if (!Object.prototype.hasOwnProperty.call(map, keyName)) return prev; // nothing to remove
            const edited: StyleMap = { ...map };
            delete edited[keyName];
            return withBreakpointStyles(next, activeBreakpoint, edited) as unknown as AttributesMap;

        });
    }, [updateFn, activeBreakpoint]);

    const unsetMany = useCallback((keys: readonly string[]) => {
        if (!Array.isArray(keys) || keys.length === 0) return;

        updateFn((prev) => {
            const next = { ...(prev || {}) } as BlockAttributes;
            
            seedCosteredId(next); // ensure a stable costeredId - we always want a costeredId even if all styles are cleared
            next.costered = ensureShape(next.costered);

            const map: StyleMap = getStylesForBreakpoint(next, activeBreakpoint);
            let changed = false;
            const edited: StyleMap = { ...map };
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]!;
                if (Object.prototype.hasOwnProperty.call(edited, key)) {
                    delete edited[key];
                    changed = true;
                }
            }
            if (!changed) return prev;
            return withBreakpointStyles(next, activeBreakpoint, edited) as unknown as AttributesMap;
        });
    }, [updateFn, activeBreakpoint]);

    const withPrefix = useCallback(
        (prefix: string) => ({
            set: (keyName: string, value: unknown) => set(`${prefix}${keyName}`, value),
            setMany: (obj: Record<string, unknown>) => {
                const namespaced: Record<string, unknown> = {};
                for (const [keyName, value] of Object.entries(obj)) {
                    namespaced[`${prefix}${keyName}`] = value;
                }
                setMany(namespaced);
            },
            unset: (keyName: string) => unset(`${prefix}${keyName}`),
            unsetMany: (keys: readonly string[]) => unsetMany(keys.map((s) => `${prefix}${s}`)),
    }), [set, setMany, unset, unsetMany]);

    return { set, setMany, unset, unsetMany, withPrefix, activeBreakpoint };
}