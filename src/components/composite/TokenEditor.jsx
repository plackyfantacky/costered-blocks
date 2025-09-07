import { useState, useCallback, useMemo } from '@wordpress/element';
import { TextControl, Tooltip, Button, Flex, FlexItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import Token from '@components/composite/Token';
import CustomToggleGroup from "@components/CustomToggleGroup";

const isLineNames = (t) => /^\s*\[[^\[\]]+\]\s*$/.test(String(t || ''));

export function TokenEditor({ tokens, onAdd, onEdit, onRemove, onMove, labels, allowLineNames = true }) {

    const defaultLabels = useMemo(() => ({
        add: __('Add', 'costered-blocks'),
        addPlaceholder: __('Add token', 'costered-blocks'),
        addLineNames: __('Add line names', 'costered-blocks'),
        listAriaLabel: __('List of tokens', 'costered-blocks'),
        moveLeft: __('Move left', 'costered-blocks'),
        moveRight: __('Move right', 'costered-blocks'),
        remove: __('Remove', 'costered-blocks'),
        expand: __('Edit token', 'costered-blocks'),
        collapse: __('Close editor', 'costered-blocks'),
    }), []);
    const l = useMemo(() => ({ ...defaultLabels, ...(labels || {}) }), [defaultLabels, labels]);

    const [draft, setDraft] = useState('');
    const [expandedIndex, setExpandedIndex] = useState(null); // number | null

    const add = useCallback(() => {
        const value = String(draft || '').trim();
        if (!value) return;
        onAdd(value);
        setDraft('');
        setExpandedIndex(null);
    }, [draft, onAdd]);

    const addNames = useCallback(() => {
        const value = String(draft || '').trim();
        if (!value) return;
        onAdd(`[${value}]`);
        setDraft('');
        setExpandedIndex(null);
    }, [draft, onAdd]);

    const toggleToken = useCallback((index, nextOpen) => {
        setExpandedIndex(nextOpen ? index : null);
    }, []);

    const handleEdit = useCallback((index, value) => {
        onEdit(index, value);
    }, [onEdit]);

    const handleRemove = useCallback((index) => {
        onRemove(index);
        setExpandedIndex((current) => (current === index ? null : current > index ? current - 1 : current));
    }, [onRemove]);

    const handleMove = useCallback((index, direction) => {
        onMove(index, direction);
        setExpandedIndex((current) => (current === index ? index + direction : current === index + direction ? index : current));
    }, [onMove]);

    return (
        <div className="costered-token-editor" role="list" aria-label={l.listAriaLabel}>
            <div className="costered-token-list">
                {tokens.map((token, index) => (
                    <Token
                        key={`${index}-${token}`}
                        index={index}
                        value={token}
                        isExpanded={expandedIndex === index}
                        onToggle={toggleToken}
                        onRemove={handleRemove}
                        onChange={handleEdit}
                        onMoveLeft={(i) => handleMove(i, -1)}
                        onMoveRight={(i) => handleMove(i, +1)}
                        labels={l}
                    />
                ))}
            </div>
            <div className="costered-token-add">
                <TextControl
                    placeholder={l.addPlaceholder}
                    value={draft}
                    onChange={setDraft}
                    onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />

                {allowLineNames ? (
                    <Flex className="costered-token-add-options" gap={0} align="center" style={{ width: 'fit-content' }}>
                        <Button icon="editor-code" onClick={add} label={l.add} />
                        <Button icon="tag" onClick={addNames} label={l.addLineNames} />
                    </Flex>
                ) : 
                (
                    <Button variant="secondary" onClick={add}>{l.add}</Button>
                )}
            </div>
        </div>
    )
}