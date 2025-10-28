import { 
    createContext, 
    useCallback, 
    useContext, 
    useEffect, 
    useMemo, 
    useRef, 
    useState 
} from '@wordpress/element';
import { subscribe, select } from '@wordpress/data';

type FieldId = string;

type UnsavedMeta = {
    unsaved: boolean;
    source?: string | null; // optional source info (e.g. which panel made the change)
};

type Ctx = {
    setUnsaved: (id: FieldId, flag: boolean, source?: string) => void;
    isFieldUnsaved: (id: FieldId) => boolean;
    unsavedFields: { id: string; source?: string }[];
};

const UnsavedCtx = createContext<Ctx | null>(null);

function computeEditorUnsaved(): boolean {
    try {
        // Post editor: the canonical flag
        const editor = select('core/editor') as any;
        if (editor?.isEditedPostDirty?.()) return true;

        // Generic entity fallback (works for site editor/patterns too)
        const core = select('core') as any;
        const postType = editor?.getCurrentPostType?.();
        const postId = editor?.getCurrentPostId?.();
        
        if (core?.hasEditsForEntityRecord && postType && postId != null) {
            if (core.hasEditsForEntityRecord('postType', postType, postId)) return true;
        }

        // If we’re not in a regular post editor, try the current edited entity from core-data (site editor / templates / template parts / patterns)
        const coreAny = core as any;
        const dirtyEntities = 
            (typeof coreAny.__experimentalGetDirtyEntityRecords === 'function'
                ? coreAny.__experimentalGetDirtyEntityRecords()
                : undefined)
            ?? (typeof coreAny.getDirtyEntityRecords === 'function'
                ? coreAny.getDirtyEntityRecords()
            : undefined);
        if (Array.isArray(dirtyEntities) && dirtyEntities.length > 0) return true;

        // Very last fallback: some builds expose a generic flag on block-editor
        const blockEditor = select('core/block-editor') as any;
        if (blockEditor?.hasChanges?.()) return true;
        if (blockEditor?.hasChangedBlocks?.()) return true;

    } catch { /* no-op */ }
    return false;
}

export function UnsavedFieldsProvider({ children }: { children: React.ReactNode }) {
    const [isEditorUnsaved, setIsEditorUnsaved] = useState<boolean>(computeEditorUnsaved());
    const unsaved = useRef<Map<FieldId, UnsavedMeta>>(new Map());
    const [rev, setRev] = useState(0);
    const savingRef = useRef<boolean>(false);

    useEffect(() => {
        let wasAutosaving = false;

        const unsubscribe = subscribe(() => {
            const editor: any = select('core/editor');
            const next = computeEditorUnsaved();

            const isSaving = !!editor?.isSavingPost?.();
            const isAutosaving = !!editor?.isAutosavingPost?.();
            const justSaved = savingRef.current && !isSaving;
            savingRef.current = isSaving;

            // functional update avoids stale closure and we keep one subscription
            setIsEditorUnsaved(prev => (prev !== next ? next : prev));

            if (isAutosaving) wasAutosaving = true;

            // only clear unsaved fields if we just finished a non-autosave manual save
            const finishedManualSave = justSaved && !wasAutosaving && !isAutosaving;

            if (finishedManualSave || !next) {
                if (unsaved.current.size) {
                    unsaved.current.clear();
                    setRev(n => n + 1);
                }
            }
            if (!isSaving && !isAutosaving) wasAutosaving = false;
        });

        return () => unsubscribe();
    }, []); // subscribe once on mount

    const setUnsaved = useCallback(
        (id: FieldId, flag: boolean, source?: string) => {
            const current = unsaved.current;
            const existing: UnsavedMeta | undefined = current.get(id);

            if (flag) {
                const meta: UnsavedMeta = { unsaved: true };
                if (source !== undefined && source !== null) meta.source = source;
                
                current.set(id, meta);
                setRev((n) => n + 1);
            } else if (existing) {
                current.delete(id);
                setRev((n) => n + 1);
            }
        },
        []
    );

    const isFieldUnsaved = useCallback((id: FieldId) => unsaved.current.has(id), []);

    const unsavedFields = useMemo(() => {
        return Array.from(unsaved.current.entries()).map(([id, meta]) => 
            meta.source ? { id, source: meta.source } : { id }
        );
    }, [rev]);

    const value = useMemo<Ctx>(
        () => ({
            setUnsaved,
            isFieldUnsaved: (id) => unsaved.current.has(id),
            unsavedFields,
    }), [setUnsaved, isFieldUnsaved, isEditorUnsaved, unsavedFields]);

    return <UnsavedCtx.Provider value={value}>{children}</UnsavedCtx.Provider>;
}

export function useUnsavedContext(): Ctx {
    const ctx = useContext(UnsavedCtx);
    if (!ctx) throw new Error('useUnsavedContext must be used within an UnsavedFieldsProvider');
    return ctx;
}