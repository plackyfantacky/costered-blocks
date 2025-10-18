import { useState, useEffect, useCallback, useMemo, Fragment } from '@wordpress/element';
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
    mergeLeft: string;
    splitOut: string;
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

    const labels = useMemo<Required<Labels>>(() => ({
        addPlaceholder: L('addPlaceholder', '#Enter value…#'),
        addLabel: L('addLabel', '#Add [Name]#'),
        addToken: L('addToken', '#Add measurement#'),
        emptyState: L('emptyState', '#No tokens yet.#'),
        mergeLeft: L('mergeLeft', '#Merge with left#'),
        splitOut: L('splitOut', '#Split from group#'),
        duplicate: L('duplicate', '#Duplicate#'),
    }), [L]);

    const [items, setItems] = useState<TokenAtomicItem[]>(() => adapter.expand(value));
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // “Add” control state
    const [addText, setAddText] = useState<string>('');

    useEffect(() => {
        setItems(adapter.expand(value));
        setExpandedIndex(null);
    }, [value, adapter]);

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
        if (!item) return;
        
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

    const duplicateAt = useCallback((index: number) => {
        const item = items[index];
        if (!item) return;
        const next = items.slice();
        next.splice(index + 1, 0, { ...item });
        commit(next);
        setExpandedIndex(index + 1);
    }, [items, commit]);

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
                { items.map((item, index) => {
                    const isExpanded = expandedIndex === index;
                    const typeClass = item.kind === 'name' ? 'label-token' : 'value-token';
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
                                onDuplicate={(i) => duplicateAt(i)}
                                onMoveLeft={(i) => moveBy(i, -1)}
                                onMoveRight={(i) => moveBy(i, 1)}
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