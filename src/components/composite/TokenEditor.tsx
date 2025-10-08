import { useState, useCallback, useMemo } from '@wordpress/element';
import { TextControl, Button, Flex } from '@wordpress/components';
import type { KeyboardEventHandler } from "react";

import { LABELS as DEFAULT_LABELS  } from '@labels';
import Token from '@components/composite/Token';

type Labels = Partial<{
    listAriaLabel: string;
    addPlaceholder: string;
    addToken: string;
    addLabel: string;
    expand: string;
    collapse: string;
    remove: string;
    moveLeft: string;
    moveRight: string;
}>;

type Props = {
    tokens: readonly string[];
    onAdd: (value: string) => void;
    onEdit: (index: number, value: string) => void;
    onRemove: (index: number) => void;
    onMove: (index: number, direction: number) => void;
    labels?: Labels;
    allowLineNames?: boolean; //default true
    className?: string;
    disabled?: boolean;
};

export function TokenEditor({ 
    tokens,
    onAdd,
    onEdit,
    onRemove,
    onMove,
    labels,
    allowLineNames = true,
    className = '',
    disabled = false
}: Props) {

    const tokenEditorLabels = useMemo(
        () => ({ ...DEFAULT_LABELS.tokenEditor, ...labels }),
        [labels]
    );

    const [draft, setDraft] = useState<string>('');
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const add = useCallback(() => {
        if (disabled) return;
        const value = String(draft ?? '').trim();
        if (!value) return;
        onAdd(value);
        setDraft('');
        setExpandedIndex(null);
    }, [draft, onAdd, disabled]);

    const addNames = useCallback(() => {
        if (disabled) return;
        const value = String(draft ?? '').trim();
        if (!value) return;
        onAdd(`[${value}]`);
        setDraft('');
        setExpandedIndex(null);
    }, [draft, onAdd, disabled]);

    const toggleToken = useCallback((index:number, nextOpen:boolean) => {
        setExpandedIndex(nextOpen ? index : null);
    }, []);

    const handleEdit = useCallback((index:number, value:string) => {
        if (disabled) return;
        onEdit(index, value);
    }, [onEdit, disabled]);

    const handleRemove = useCallback((index:number) => {
        if (disabled) return;
        onRemove(index);
        setExpandedIndex((current) => 
            current === index ? null : current !== null && current > index ? current - 1 : current
        );
    }, [onRemove, disabled]);

    const handleMove = useCallback((index: number, direction: number) => {
        if (disabled) return;
        onMove(index, direction);
        setExpandedIndex((current): number | null => {
            if (current === index) return index + direction;
            if (current === index + direction) return index;
            return current;
        });
    }, [onMove]);

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            add();
        }
    }

    return (
        <div className="costered-blocks--token-editor" role="list" aria-label={tokenEditorLabels.listAriaLabel}>
            <div className="costered-blocks--token-editor--list">
                {tokens.map((tokenValue, index) => (
                    <Token
                        key={`token-${index}`}
                        index={index}
                        value={tokenValue}
                        isExpanded={expandedIndex === index}
                        onToggle={toggleToken}
                        onRemove={handleRemove}
                        onChange={handleEdit}
                        onMoveLeft={(i) => handleMove(i, -1)}
                        onMoveRight={(i) => handleMove(i, +1)}
                        labels={tokenEditorLabels}
                    />
                ))}
            </div>
            <div className="costered-blocks--token-editor--add">
                <TextControl
                    placeholder={tokenEditorLabels.addPlaceholder}
                    value={draft}
                    onChange={setDraft}
                    onKeyDown={handleKeyDown}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />

                {allowLineNames ? (
                    <Flex className="costered-blocks--token-editor--add-options" gap={0} align="center">
                        <Button icon="editor-code" onClick={add} label={tokenEditorLabels.addToken} />
                        <Button icon="tag" onClick={addNames} label={tokenEditorLabels.addLabel} />
                    </Flex>
                ) : 
                (
                    <Button variant="secondary" onClick={add}>{tokenEditorLabels.addToken}</Button>
                )}
            </div>
        </div>
    )
}