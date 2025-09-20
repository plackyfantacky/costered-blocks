import { useEffect, useRef, useCallback } from '@wordpress/element';
import { TextControl, Button, Tooltip, Popover } from '@wordpress/components';

import { LABELS } from '@labels';

export default function Token({
    index,
    value,
    isExpanded,
    onToggle,
    onRemove,
    onChange,
    onMoveLeft,
    onMoveRight,
    labels,
    emptyPlaceholder,
    floatingEditor = false, // opt-in (default false)
    popoverPlacement = 'bottom-start',
    popoverWidth,
}) {

    // Ref to the chip button, used as anchor for the popover (if floatingEditor)
    const chipRef = useRef(null);
    
    // Manage focus on the input when expanded
    const inputElementRef = useRef(null);
    const lastOpenReasonRef = useRef('pointer');

    const setInputRef = useCallback((node) => {
        const element = node?.inputRef?.current || node || null;
        inputElementRef.current = element;
    }, []);

    // Focus policy:
    // - If opened via keyboard, focus and put caret at the *end* (easy typing).
    // - If opened via mouse, do NOT set selection — user will click where they want.
    useEffect(() => {
        // Only manage focus when expanded and the input is present
        if (!isExpanded || !inputElementRef.current) return;

        if (lastOpenReasonRef.current === 'keyboard') {
            const element = inputElementRef.current;
            element.focus?.({ preventScroll: true });

            const len = typeof element.value === 'string' ? element.value.length : 0;
            if (typeof element.setSelectionRange === 'function') {
                element.setSelectionRange(len, len);
            }
        }
        // reset; subsequent opens without an explicit reason default to 'pointer'
        lastOpenReasonRef.current = 'pointer';
    }, [isExpanded]);

    const labelData = {
        expand: LABELS.token.expand,
        collapse: LABELS.token.collapse,
        remove: LABELS.token.remove,
        moveLeft: LABELS.token.moveLeft,
        moveRight: LABELS.token.moveRight,
        ...labels,
    };

    const chipText = value && value.trim().length ? value : (emptyPlaceholder ?? '');

    const handleRemove = useCallback((event) => {
        event.stopPropagation(); // don’t toggle when pressing the X
        onRemove(index);
    }, [index, onRemove]);

    const openFromPointer = useCallback(() => {
        lastOpenReasonRef.current = 'pointer';
        onToggle(index, !isExpanded);
    }, [index, isExpanded, onToggle]);

    const openFromKeyboard = useCallback(() => {
        lastOpenReasonRef.current = 'keyboard';
        onToggle(index, !isExpanded);
    }, [index, isExpanded, onToggle]);

    const handleChipKeyDown = useCallback((event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFromKeyboard();
        } else if (event.key === 'Escape' && isExpanded) {
            event.preventDefault();
            onToggle(index, false);
        }
    }, [openFromKeyboard, index, isExpanded, onToggle]);

    const EditorPanel = (
        <div id={`costered-blocks--token--panel-${index}`} className="costered-blocks--token--panel">
            <TextControl
                ref={setInputRef}
                value={value ?? ''}
                placeholder={emptyPlaceholder ?? ''}
                onChange={(next) => onChange(index, next)}
                onBlur={(event) => onChange(index, event?.target?.value ?? '')}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
            />
            <div className="costered-blocks--token--actions">
                <Tooltip text={labelData.moveLeft}>
                    <Button
                        icon="arrow-left-alt2"
                        onClick={() => onMoveLeft(index)}
                        label={labelData.moveLeft}
                        variant="tertiary"
                    />
                </Tooltip>
                <Tooltip text={labelData.moveRight}>
                    <Button
                        icon="arrow-right-alt2"
                        onClick={() => onMoveRight(index)}
                        label={labelData.moveRight}
                        variant="tertiary"
                    />
                </Tooltip>
            </div>
        </div>
    );



    return (
        <div className={`costered-blocks--token ${isExpanded ? 'is-expanded' : ''}`}>
            {/* collapsed “chip” header */}
            <div className="costered-blocks--token--chip" ref={chipRef}>
                <button
                    type="button"
                    className="costered-blocks--token--chipButton"
                    aria-expanded={isExpanded}
                    aria-controls={`costered-token-panel-${index}`}
                    onClick={openFromPointer}
                    onKeyDown={handleChipKeyDown}
                    title={isExpanded ? labelData.collapse : labelData.expand}
                >
                    <span className="costered-blocks--token--chipText">{chipText}</span>
                </button>

                <Tooltip text={labelData.remove}>
                    <Button
                        icon="no-alt"
                        label={labelData.remove}
                        onClick={handleRemove}
                        variant="tertiary"
                        className="costered-blocks--token--remove"
                    />
                </Tooltip>
            </div>
            {/* Inline panel (current behaviour) */}
            {!floatingEditor && isExpanded && EditorPanel}

            {/* Floating panel (opt-in) */}
            {floatingEditor && isExpanded && (
                <Popover
                    className="costered-blocks--token--popover"
                    anchor={chipRef.current}
                    placement={popoverPlacement} // e.g. 'bottom-start', 'right-start'
                    onClose={() => onToggle(index, false)}
                    focusOnMount="firstElement"
                    expandOnMobile
                >
                    <div
                        className="costered-blocks--token--popoverInner"
                        style={popoverWidth ? { width: popoverWidth } : undefined}
                    >
                        {EditorPanel}
                    </div>
                </Popover>
            )}
        </div>
    );
}
