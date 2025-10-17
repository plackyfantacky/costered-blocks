// TokenListEditor.tsx
import type { ReactNode } from "react";
import { useState, useEffect, useCallback, useMemo, Fragment } from '@wordpress/element';
import { Button, TextControl, Flex, FlexItem } from '@wordpress/components';

import { t, scoped } from '@labels';
import Token from './Token';
import type { TokenAtomicItem, TokenModelAdapter } from '@types';

type Labels = Partial<{
    addPlaceholder: string;
    addLabel: string;
    addToken: string;
    emptyState: string;
    mergeLeft: string;
    splitOut: string;
}>;

type Props<Persisted> = {
    persisted: Persisted;
    adapter: TokenModelAdapter<Persisted>;
    onChange: (next: Persisted) => void;
    labelScope: string;
    floatingEditor?: boolean;
    popoverPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
    popoverWidth?: string | number;
    allowRaw: boolean;
    showPerTokenGrouping: boolean;
    toolbar?: ReactNode;
    labels?: Labels;
}

export function TokenListEditor<Persisted>({
    persisted,
    adapter,
    onChange,
    labelScope,
    floatingEditor = false,
    popoverPlacement = 'bottom-start',
    popoverWidth = 200,
    //allowRaw = true,
    showPerTokenGrouping = true,
    toolbar,
}: Props<Persisted>) {

    const L = useMemo(() => scoped(labelScope), [labelScope]);
    const labels = useMemo<Required<Labels>>(() => ({
        addPlaceholder: L('addPlaceholder', '#Enter value…#'),
        addLabel: L('addLabel', '#Add [Name]#'),
        addToken: L('addToken', '#Add measurement#'),
        emptyState: L('emptyState', '#No tokens yet.#'),
        mergeLeft: L('mergeLeft', '#Merge with left#'),
        splitOut: L('splitOut', '#Split from group#'),
    }), [L]);

    const [items, setItems] = useState<TokenAtomicItem[]>(() => adapter.expand(persisted));
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // “Add” control state
    const [addText, setAddText] = useState<string>('');

    useEffect(() => {
        const expanded = adapter.expand(persisted);
        
        setItems(expanded);
        setExpandedIndex(null);
    }, [persisted, adapter]);

    const commit = useCallback((draft: TokenAtomicItem[]) => {
        setItems(draft);
        onChange(adapter.collapse(draft));
    }, [onChange, adapter]);

    const editAt = useCallback((index: number, text: string) => {
        commit(items.map((item, i) => i === index ? { ...item, text: text.trim() } : item));
    } , [items, commit]);

    const removeAt = useCallback((index: number) => {
        const next = items.slice();
        next.splice(index, 1);
        commit(next);
        setExpandedIndex((current) => (current === index ? null : current != null && current > index ? current - 1 : current));
    }, [items, commit]);

    const moveBy = useCallback((index: number, delta: number) => {
        const target = index + delta;
        if (index < 0 || index >= items.length) return;
        if (target < 0 || target >= items.length) return;
        if (adapter.canMove && !adapter.canMove(items, index, delta)) return;

        const item = items[index];
        if (item === undefined) return;
        
        const next = items.slice();
        next.splice(index, 1);
        next.splice(target, 0, item);

        commit(next);
        setExpandedIndex((current) => {
            if (current === index) return target;
            if (current === target) return index;
            return current;
        });
    }, [items, commit, adapter]);

    const mergeWithPrev = useCallback((index: number) => {
        if (!adapter.mergeWithPrev) return;
        commit(adapter.mergeWithPrev(items, index));
    }, [items, commit, adapter]);

    const clearGroup = useCallback((index: number) => {
        if (!adapter.clearGroup) return;
        commit(adapter.clearGroup(items, index));
    }, [items, commit, adapter]);

    const addNamedToken = useCallback(() => {
        const raw = addText.trim();
        if (!raw) return;

        // Accept "[a b]" or "a b"; strip outer brackets if present
        const inner = raw.startsWith('[') && raw.endsWith(']') 
                ? raw.slice(1, -1).trim()
                : raw.replace(/^\[|\]$/g, '').trim();

        const names = inner.split(/\s+/).filter(Boolean);
        if (!names.length) return;

        const insertionIndex = expandedIndex != null ? expandedIndex + 1 : items.length;
        const gid = items.reduce((max, item) => Math.max(max, item.groupId ?? 0), 0) + 1;
        
        const next = items.slice();
        next.splice(
            insertionIndex,
            0,
            ...names.map(name => ({ kind: 'name' as const, text: name, groupId: gid }))
        );

        commit(next);
        setAddText('');
        setExpandedIndex(insertionIndex + names.length - 1);
    }, [addText, expandedIndex, items, commit]);

    const addRawToken = useCallback(() => {
        const text = addText.trim();
        if (!text) return;

        const insertionIndex = expandedIndex != null ? expandedIndex + 1 : items.length;
        const next = items.slice();

        next.splice(insertionIndex, 0, { kind: 'raw', text });

        commit(next);
        setAddText('');
        setExpandedIndex(insertionIndex);
    }, [addText, expandedIndex, items, commit]);

    // keyboard: Enter = add size; Cmd/Ctrl+Enter = add name; Esc = collapse
    const onAddKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (event.metaKey || event.ctrlKey) addNamedToken();
            else addRawToken();
        }
        if (event.key === 'Escape') setExpandedIndex(null);
    }, [addRawToken, addNamedToken]);

    const hasItems = items.length > 0;

    return (
        <div className="costered-blocks--token-editor">
            <div className="costered-blocks--token-editor--controls">
                <Flex 
                    className="costered-blocks--token-editor--add"
                    align="center"
                >
                    <TextControl
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
                    {toolbar ? <FlexItem style={{ marginLeft: 'auto' }}>{toolbar}</FlexItem> : null}
                </Flex>
            </div>
                
            <div className="costered-blocks--token-editor--list">
                { !hasItems && (
                    <div className="costered-blocks--token-editor--empty">
                        {labels.emptyState}
                    </div>
                )}
                { items.map((item, index) => {
                    const isExpanded = expandedIndex === index;
                    return (
                        <Fragment key={`token-${index}`}>
                            <Token
                                key={`token-${index}`} //shuts up React warning about non-unique keys
                                index={index}
                                value={item.text}
                                isExpanded={isExpanded}
                                onToggle={(i, open) => setExpandedIndex(open ? i : null)}
                                onRemove={removeAt}
                                onChange={editAt}
                                onMoveLeft={(i) => moveBy(i, -1)}
                                onMoveRight={(i) => moveBy(i, 1)}
                                floatingEditor={floatingEditor}
                                popoverPlacement={popoverPlacement}
                                popoverWidth={popoverWidth}
                            />
                            { showPerTokenGrouping && item.kind === 'name' && (
                                <div className="costered-blocks--token-editor--actions">
                                    { adapter.mergeWithPrev && (
                                        <Button
                                            __next40pxDefaultSize
                                            variant="secondary"
                                            onClick={() => mergeWithPrev(index)}
                                            aria-label={labels.mergeLeft}
                                            title={labels.mergeLeft}
                                        >
                                            ⟵ merge
                                        </Button>
                                    )}
                                    {adapter.clearGroup && item.groupId != null && (
                                        <Button
                                            __next40pxDefaultSize
                                            variant="secondary"
                                            onClick={() => clearGroup(index)}
                                            aria-label={labels.splitOut}
                                            title={labels.splitOut}
                                        >
                                            split
                                        </Button>
                                    )}
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
}