import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from '@wordpress/element';
import { Button, TextControl, Flex} from '@wordpress/components';

import { scoped } from '@labels';
import Token from './Token';
import { TracksTokensAdapter } from '@utils/tokenTracksAdapter';
import type { TokenAtomicItem } from '@types';

type Labels = Partial<{
    addPlaceholder: string;
    addLabel: string;
    addToken: string;
    emptyState: string;
    duplicate: string;
}>;

type Props = {
    value: string;
    onChange: (next: string) => void;
    labelScope: string;
    floatingEditor?: boolean;
    popoverPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
    popoverWidth?: string | number;
};

export function TokenEditor({ 
    value,
    onChange,
    labelScope,
    floatingEditor = false,
    popoverPlacement = 'bottom-start',
    popoverWidth = 200,
}: Props) {

    const adapter = useMemo(() => TracksTokensAdapter, []);
    const L = useMemo(() => scoped(labelScope), [labelScope]);
    const internalCommitRef = useRef(false);

    const labels = useMemo<Required<Labels>>(() => ({
        addPlaceholder: L('addPlaceholder', '#Enter value…#'),
        addLabel: L('addLabel', '#Add [Name]#'),
        addToken: L('addToken', '#Add measurement#'),
        emptyState: L('emptyState', '#No tokens yet.#'),
        duplicate: L('duplicate', '#Duplicate#'),
    }), [L]);

    const withIds = (list: Omit<TokenAtomicItem, '_id'>[] | TokenAtomicItem[]): TokenAtomicItem[] => {
        return list.map((item) => {
            if ('_id' in item && item._id) return item;
            return { ...item, _id: crypto.randomUUID() };
        });
    }

    const [items, setItems] = useState<TokenAtomicItem[]>(() => withIds(adapter.expand(value)));
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [addText, setAddText] = useState<string>('');

    useEffect(() => {
        if (internalCommitRef.current) {
            internalCommitRef.current = false;
            return;
        }

        // Avoid pointless re-hydrates if parent echoed the same value back
        const currentCollapsed = adapter.collapse(items);
        if (currentCollapsed === value) return;

        setItems(withIds(adapter.expand(value)));
        setExpandedId(null);
    }, [value, adapter]);

    const commit = useCallback((draft: TokenAtomicItem[]) => {
        setItems(draft);
        internalCommitRef.current = true;
        onChange(adapter.collapse(draft));
    }, [onChange, adapter]);

    const findIndexById = useCallback(
        (id: string) => items.findIndex(item => item._id === id),
        [items]
    );

    const editAt = useCallback((index: number, text: string) => {
        commit(items.map((item, i) => 
            i === index ? { ...item, text: text.trim() } : item
        ));
    } , [items, commit]);

    const removeById = useCallback((id: string) => {
        const next = items.filter(item => item._id !== id);
        commit(next);
        setExpandedId(current => (current === id ? null : current));

    }, [items, commit]);

    const moveById = useCallback((id: string, delta: number) => {
        const index = findIndexById(id);
        if (index === -1) return;
        const target = index + delta;
        if (target < 0 || target >= items.length) return;

        if (adapter.canMove && !adapter.canMove(items, index, delta)) return;

        const next = [...items];
        const [moved] = next.splice(index, 1);
        if (!moved) return;
        next.splice(target, 0, moved);

        commit(next);
    }, [items, commit, findIndexById, adapter]);

    const duplicateById = useCallback((id: string) => {
        const index = findIndexById(id);
        if (index === -1) return;
        
        const next = [ ...items ];
        const original = next[index];
        if (!original) return;

        const clone: TokenAtomicItem = { ...original, _id: crypto.randomUUID() };
        next.splice(index + 1, 0, clone);
        
        commit(next);
        setExpandedId(clone._id);
    }, [items, commit, findIndexById]);

    const addNamedToken = useCallback(() => {
        const raw = addText.trim();
        if (!raw) return;

        // Accept "[a b]" or "a b"; strip outer brackets if present
        const inner = raw.startsWith('[') && raw.endsWith(']') 
            ? raw.slice(1, -1).trim()
            : raw.replace(/^\[|\]$/g, '').trim();

        const names = inner.split(/\s+/).filter(Boolean);
        if (!names.length) return;

        const insertionIndex =
            expandedId ? items.findIndex(item => item._id === expandedId) + 1 : items.length;
        const gid = items.reduce((max, item) => Math.max(max, item.groupId ?? 0), 0) + 1;
        
        const next = items.slice();
        next.splice(
            insertionIndex,
            0,
            ...names.map(name => ({
                kind: 'name' as const,
                text: name,
                groupId: gid,
                _id: crypto.randomUUID(),
            }))
        );

        commit(next);
        setAddText('');
        const lastAdded = next[insertionIndex + names.length - 1];
        if (lastAdded?._id) setExpandedId(lastAdded._id);
    }, [addText, expandedId, items, commit]);

    const addRawToken = useCallback(() => {
        const text = addText.trim();
        if (!text) return;
        const insertionIndex =
            expandedId ? items.findIndex(item => item._id === expandedId) + 1 : items.length;
        const next = items.slice();

        next.splice(insertionIndex, 0, { kind: 'raw', text, _id: crypto.randomUUID() });

        commit(next);
        setAddText('');

        const newToken = next[insertionIndex];
        if (newToken?._id) setExpandedId(newToken._id);
    }, [addText, expandedId, items, commit]);

    // keyboard: Enter = add size; Cmd/Ctrl+Enter = add name; Esc = collapse
    const onAddKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (event.metaKey || event.ctrlKey) addNamedToken();
            else addRawToken();
        }
        if (event.key === 'Escape') setExpandedId(null);
    }, [addRawToken, addNamedToken]);

    useEffect(() => {
        if (expandedId && !items.some(i => i._id === expandedId)) {
            setExpandedId(null);
        }
    }, [items, expandedId]);

    const hasItems = items.length > 0;

    const handleToggleExpand = useCallback((id: string) => {
        setExpandedId(prev => {
            const next = prev === id ? null : id;
            return next;
        });
    }, []);

    return (
        <div className="costered-blocks--token-editor">
            <div className="costered-blocks--token-editor--controls">
                <Flex className="costered-blocks--token-editor--add" align="center">
                    <TextControl
                        className="costered-blocks--token-editor--add-input"
                        placeholder={labels.addPlaceholder}
                        value={addText}
                        onChange={setAddText}
                        onKeyDown={onAddKeyDown}
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                    />
                    <Flex className="costered-blocks--token-editor--add-options" gap={0} align="center" justify="flex-start">
                        <Button
                            icon="editor-code"
                            variant="tertiary"
                            onClick={addRawToken}
                            aria-label={labels.addToken}
                            title={labels.addToken}
                        />
                        <Button
                            icon="tag"
                            variant="tertiary"
                            onClick={addNamedToken}
                            aria-label={labels.addLabel}
                            title={labels.addLabel}
                        />
                    </Flex>
                </Flex>
            </div>
                
            <div className="costered-blocks--token-editor--list">
                { !hasItems && (
                    <div className="costered-blocks--token-editor--empty">
                        {labels.emptyState}
                    </div>
                )}
                {items.map((item, index) => {
                    const key = item._id;
                    const isExpanded = expandedId === item._id;
                    const typeClass = item.kind === 'name' ? 'label-token' : 'value-token';
                    return (
                        <Fragment key={key}>
                            <Token
                                key={key}
                                tokenId={item._id}
                                index={index}
                                value={item.text}
                                isExpanded={isExpanded}
                                onToggle={() => handleToggleExpand(item._id)}
                                onRemove={() => removeById(item._id)}
                                onChange={editAt}
                                onDuplicate={() => duplicateById(item._id)}
                                onMoveLeft={() => moveById(item._id, -1)}
                                onMoveRight={() => moveById(item._id, 1)}
                                floatingEditor={floatingEditor}
                                popoverPlacement={popoverPlacement}
                                popoverWidth={popoverWidth}
                                typeClass={typeClass}
                            />
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
}