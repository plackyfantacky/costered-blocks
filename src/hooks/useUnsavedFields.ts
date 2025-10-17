// @hooks/useUnsavedField.ts
import { useMemo, useCallback } from '@wordpress/element';
import { useUnsavedContext } from '@providers/UnsavedFieldsProvider';
import  { makeFieldId } from '@utils/blockUtils';
import type { UnsavedAttr } from '@types';

// get all fields
export function useUnsavedFields() {
    const { unsavedFields} = useUnsavedContext();
    return { fields: unsavedFields}
}

// get one field by costeredId+attr
export function useUnsavedAttr(
    costeredId: string | null,
    attr: string,
    source?: string
) {
    const { isFieldUnsaved, setUnsaved } = useUnsavedContext();

    const fieldId = useMemo(
        () => (costeredId ? makeFieldId(costeredId, attr) : null), 
        [costeredId, attr]
    );

    const unsaved = fieldId ? isFieldUnsaved(fieldId) : false;

    const mark = useCallback(
        (flag: boolean, overrideSource?: string) => {
            if (fieldId) {
                const effectiveSource = overrideSource ?? source;
                setUnsaved(fieldId, flag, effectiveSource);
            }
        },
        [fieldId, setUnsaved, source]
    );

    return { fieldId, unsaved, setUnsaved: mark };
}

/** Returns whether any of the specified fields are unsaved. */
export function useUnsavedAttrs(
    costeredId: string | null,
    attrs: string[],
    source?: string
) {
    const { fields } = useUnsavedFields();
    const prefix = costeredId ? `${costeredId}:` : null;

    const matching = useMemo((): UnsavedAttr[] => {
        if (!prefix || !Array.isArray(fields)) return [];
        
        const normalised = fields.map((field) => {
            return typeof field === 'string' ? { id: field } : field;
        });

        const filtered = normalised.filter((field): boolean => {
            const { id } = field;
            if (!id) return false;

            const matchesId =
                id.startsWith(prefix) &&
                attrs.some((attr) => id.endsWith(attr));

            const matchesSource = 
                source === undefined || field.source === source;

            return matchesId && matchesSource;
        });

        return filtered.map((field) => {
            const base = {
                id: field.id,
                attr: field.id.replace(prefix, ''),
            };
            return field.source ? { ...base, source: field.source } : base;
        });
    }, [fields, prefix, attrs, source]);
    
    const hasUnsaved = matching.length > 0;
    const sources = Array.from(
        new Set(matching.map((field) => field.source).filter(Boolean))
    );

    return {
        hasUnsaved,
        unsavedFields: matching,
        count: matching.length,
        sources
    };
}

export function useUnsavedBySource(costeredId: string | null, attrs?: string[]) {
    const { unsavedFields } = useUnsavedAttrs( costeredId, attrs ?? [] );

    const grouped = useMemo(() => {
        const out: Record<string, typeof unsavedFields> = {};
        for (const field of unsavedFields) {
            const source = field.source ?? 'unknown';
            if (!out[source]) out[source] = [];
            out[source].push(field);
        }
        return out;
    }, [unsavedFields]);

    return {
        all: unsavedFields,
        bySource: grouped,
        get: (source: string) => grouped[source] ?? [],
        hasAny: (source: string) => (grouped[source]?.length ?? 0) > 0
    }
}