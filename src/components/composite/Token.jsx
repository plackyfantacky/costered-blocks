import { useEffect, useRef, useCallback } from '@wordpress/element';
import { TextControl, Button, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Token({ index, value, isExpanded, onToggle, onRemove, onChange, onMoveLeft, onMoveRight, labels }) {
    const inputRef = useRef(null);

    const l = {
        expand: __('Edit token', 'costered-blocks'),
        collapse: __('Close editor', 'costered-blocks'),
        remove: __('Remove', 'costered-blocks'),
        moveLeft: __('Move left', 'costered-blocks'),
        moveRight: __('Move right', 'costered-blocks'),
        ...labels,
    };

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            // focus the input when expanding
            inputRef.current.focus();
            inputRef.current.select?.();
        }
    }, [isExpanded]);

    const handleRemove = useCallback((e) => {
        e.stopPropagation(); // don’t toggle when pressing the X
        onRemove(index);
    }, [index, onRemove]);

    const handleToggle = useCallback(() => {
        onToggle(index, !isExpanded);
    }, [index, isExpanded, onToggle]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
        } else if (e.key === 'Escape' && isExpanded) {
            e.preventDefault();
            onToggle(index, false);
        }
    }, [handleToggle, index, isExpanded, onToggle]);

    return (
        <div className={`costered-token${isExpanded ? ' is-expanded' : ''}`}>
            {/* collapsed “chip” header */}
            <div className="costered-token__chip">
                <button
                    type="button"
                    className="costered-token__chipButton"
                    aria-expanded={isExpanded}
                    aria-controls={`costered-token-panel-${index}`}
                    onClick={handleToggle}
                    onKeyDown={handleKeyDown}
                    title={isExpanded ? l.collapse : l.expand}
                >
                    <span className="costered-token__chipText">{value}</span>
                </button>

                <Tooltip text={l.remove}>
                    <Button
                        icon="no-alt"
                        label={l.remove}
                        onClick={handleRemove}
                        variant="tertiary"
                        className="costered-token__remove"
                    />
                </Tooltip>
            </div>
            {/* expanded editor */}
            {isExpanded && (
                <div id={`costered-token-panel-${index}`} className="costered-token__panel">
                    <TextControl
                        ref={inputRef}
                        value={value}
                        onChange={(v) => onChange(index, v)}
                        __nextHasNoMarginBottom
                    />
                    <div className="costered-token__actions">
                        <Tooltip text={l.moveLeft}>
                            <Button
                                icon="arrow-left-alt2"
                                onClick={() => onMoveLeft(index)}
                                label={l.moveLeft}
                                variant="tertiary"
                            />
                        </Tooltip>
                        <Tooltip text={l.moveRight}>
                            <Button
                                icon="arrow-right-alt2"
                                onClick={() => onMoveRight(index)}
                                label={l.moveRight}
                                variant="tertiary"
                            />
                        </Tooltip>
                    </div>
                </div>
            )}
        </div>
    );
}
