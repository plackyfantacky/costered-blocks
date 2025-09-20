import { useState, useCallback, useMemo } from '@wordpress/element';
import { TextControl, Button, Flex } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { LABELS as DEFAULT_LABELS  } from '@labels';
import Token from '@components/composite/Token';

export function TokenEditor({ tokens, onAdd, onEdit, onRemove, onMove, labels, allowLineNames = true }) {

    const tokenEditorLabels = useMemo(() => ({ ...DEFAULT_LABELS.tokenEditor, ...labels }), [labels]);

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
                    onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
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