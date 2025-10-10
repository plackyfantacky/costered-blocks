// TokenListEditor.tsx
import type { ReactNode } from "react";
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import { Button, TextControl, Flex, FlexItem } from '@wordpress/components';


import Token from './Token';
import { CustomSelectControl as SelectControl } from "@components/CustomSelectControl";
import type { TokenAtomicItem, TokenModelAdapter } from '@types';

type Labels = Partial<{
    addLabel: string;
    addPlaceholder: string;
    addKindName: string;
    addKindRaw: string;
    emptyState: string;
    mergeLeft: string;
    splitOut: string;
}>;

type Props<Persisted> = {
    persisted: Persisted;
    adapter: TokenModelAdapter<Persisted>;
    onChange: (next: Persisted) => void;
    floatingEditor?: boolean;
    popoverPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
    popoverWidth?: string | number;
    allowRaw: boolean;
    showPerTokenGrouping: boolean;
    toolbar?: ReactNode;
    labels?: Labels;
}

type AddKind = 'name' | 'raw';

export function TokenListEditor<Persisted>({
    persisted,
    adapter,
    onChange,
    floatingEditor = false,
    popoverPlacement = 'bottom-start',
    popoverWidth = 200,
    allowRaw = true,
    showPerTokenGrouping = true,
    toolbar,
    labels: userLabels,
}: Props<Persisted>) {

    //TODO: remap these to @labels and import LABELS
    const labels = useMemo<Required<Labels>>(() => ({
        addLabel: '@@Add token@@',
        addPlaceholder: '@@Enter value…@@',
        addKindName: '@@Name [a]@@',
        addKindRaw: '@@Raw (e.g. 1fr, minmax)@@',
        emptyState: '@@No tokens yet.@@',
        mergeLeft: '@@Merge with left@@',
        splitOut: '@@Split from group@@',
        ...(userLabels || {})
    }), [userLabels]);

    const [items, setItems] = useState<TokenAtomicItem[]>(() => adapter.expand(persisted));
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // “Add” control state
    const [addText, setAddText] = useState<string>('');
    const [addKind, setAddKind] = useState<AddKind>('name');

    useEffect(() => {
        setItems(adapter.expand(persisted));
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

    // Add/Insert behaviour:
    // - If a chip is expanded, insert AFTER it (keeps local flow).
    // - Otherwise append to the end.
    const addToken = useCallback(() => {
        const text = addText.trim();
        if (!text) return;

        const insertionIndex = expandedIndex != null ? expandedIndex + 1 : items.length;
        const next = items.slice();

        if (addKind === 'name') {
            next.splice(insertionIndex, 0, { kind: 'name', text });
        } else {
            next.splice(insertionIndex, 0, { kind: 'raw', text });
        }

        commit(next);
        setAddText('');
        setExpandedIndex(insertionIndex);
    }, [addText, addKind, expandedIndex, items, commit]);

    const onAddKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addToken();
        }
        if (event.key === 'Escape') {
            setExpandedIndex(null);
        }
    }, [addToken]);

    const hasItems = items.length > 0;


    return (
        <div className="costered-blocks--token-editor">
            <div className="costered-blocks--token-editor--controls">
                <Flex align="center" wrap>
                    <FlexItem style={{ minWidth: 180 }}>
                        <TextControl
                            label={labels.addLabel}
                            placeholder={labels.addPlaceholder}
                            value={addText}
                            onChange={setAddText}
                            onKeyDown={onAddKeyDown}
                        />
                    </FlexItem>
                    <FlexItem>
                        <SelectControl
                            value={addKind}
                            onChange={(v: string) => setAddKind((v === 'raw' ? 'raw' : 'name'))}
                        >
                            <SelectControl.Option value="name">{labels.addKindName}</SelectControl.Option>
                            {allowRaw ? <SelectControl.Option value="raw">{labels.addKindRaw}</SelectControl.Option> : null}
                        </SelectControl>
                    </FlexItem>
                    <FlexItem>
                        <Button
                            variant="primary"
                            onClick={addToken}
                            disabled={addText.trim() === ''}
                        >
                            {labels.addLabel}
                        </Button>
                    </FlexItem>

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
                        <>
                            <Token
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
                        </>
                    );
                })}
            </div>
        </div>
    );
}