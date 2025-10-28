import { useCallback, useEffect, useMemo, useRef, useState } from "@wordpress/element";
import { useAttrGetter, useAttrSetter } from "@hooks";

type Options<Value> = {
    parse?: (raw: unknown) => Value;
    serialise?: (value: Value) => unknown;
    initialFallback?: Value;
    commitOn?: 'blur' | 'change';
};

export function useBreakpointState<Value = string>(
    clientId: string,
    prop: string,
    options?: Options<Value>
) {

    const parse = options?.parse ?? ((value: unknown) => value as Value);
    const serialise = options?.serialise ?? ((value: Value) => value);
    const initialFallback = options?.initialFallback as Value | undefined;
    const commitOn = options?.commitOn ?? 'blur';

    const { getRaw, bp } = useAttrGetter(clientId);
    const { set } = useAttrSetter(clientId);

    const raw = getRaw(prop);
    const parsed = useMemo(() => parse(raw), [raw]);

    const [draft, setDraft] = useState<Value>(parsed);
    const isEditing = useRef<boolean>(false);

    // when parsed changes from outside, update draft if not editing
    useEffect(() => {
        if (isEditing.current) return;
        setDraft(parsed);
    }, [parsed, bp]);

    useEffect(() => {
        // eslint-disable-next-line no-console
        console.debug('[bp-field]', { prop, bp, raw });
    }, [bp, raw, prop]);

    const commit = useCallback((next: Value) => {
        const serialised = serialise(next);
        set(prop, serialised);
    }, [prop, serialise, set]);

    const key = useMemo(() => `${clientId}:${prop}:${bp}`, [clientId, prop, bp]);

    const bind = {
        key,
        value: draft as Value,
        onFocus: () => { isEditing.current = true; },
        onBlur: commitOn === 'blur' ? () => { isEditing.current = false; commit(draft); } : undefined,
        onChange: (value: Value) => {
            setDraft(value);
            if (commitOn === 'change') commit(value);
        }
    } as const;

    return { bp, draft, setDraft, raw, commit, key, bind } as const;
}