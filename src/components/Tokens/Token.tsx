import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useRef, useCallback } from '@wordpress/element';
import { TextControl, Button, Tooltip, Popover } from '@wordpress/components';

import { LABELS } from '@labels';
import { BxCopy } from "@assets/icons";

type Labels = Partial<{
    expand: string;
    collapse: string;
    remove: string;
    moveLeft: string;
    moveRight: string;
    duplicate: string;
}>;

type Props = {
    tokenId: string;
    index: number;
    value: string;
    isExpanded: boolean;
    onToggle: () => void;
    onChange: (index: number, nextValue: string) => void;
    onRemove: (id: string) => void;
    onMoveLeft: (id: string) => void;
    onMoveRight: (id: string) => void;
    onDuplicate: (id: string) => void;
    labels?: Labels;
    emptyPlaceholder?: string;
    floatingEditor?: boolean;
    popoverPlacement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
    popoverWidth?: number | string; // e.g. 300 or '20em'
    typeClass?: string | null;
};

export default function Token({
    tokenId,
    index,
    value,
    isExpanded,
    onToggle,
    onChange,
    onRemove,
    onMoveLeft,
    onMoveRight,
    onDuplicate,
    labels,
    emptyPlaceholder,
    floatingEditor = false,
    popoverPlacement = 'bottom-start',
    popoverWidth,
    typeClass,
}: Props) {
    
    // Ref to the chip button, used as anchor for the popover (if floatingEditor)
    const chipRef = useRef<HTMLDivElement | null>(null);
    const inputElementRef = useRef<HTMLInputElement | null>(null);
    const lastOpenReasonRef = useRef<'pointer' | 'keyboard'>('pointer');

    const setInputRef = useCallback((node: any) => {
        const element: HTMLInputElement | null = 
            (node && node.inputRef && node.inputRef.current) || node || null;
        inputElementRef.current = element;
    }, []);

    // Focus policy:
    // - If opened via keyboard, focus and put caret at the *end* (easy typing).
    // - If opened via mouse, do NOT set selection — user will click where they want.
    useEffect(() => {
        if (!isExpanded || !inputElementRef.current) return; // Only manage focus when expanded and the input is present
        const element = inputElementRef.current;
        element.focus?.({ preventScroll: true });

        if (lastOpenReasonRef.current === 'keyboard') {
            const len = typeof element.value === 'string' ? element.value.length : 0;
            element.setSelectionRange?.(len, len);
        }
        lastOpenReasonRef.current = 'pointer'; // reset; subsequent opens without an explicit reason default to 'pointer'
    }, [isExpanded]);

    const labelData: Required<Labels> = {
        expand: LABELS.token.expand,
        collapse: LABELS.token.collapse,
        remove: LABELS.token.remove,
        moveLeft: LABELS.token.moveLeft,
        moveRight: LABELS.token.moveRight,
        duplicate: LABELS.token.duplicate,
        ...labels,
    } as Required<Labels>;

    const chipText = value && value.trim().length ? value : (emptyPlaceholder ?? '');
    const tokenTypeClass = typeClass ? `costered-blocks--token--type-${typeClass}` : '';

    const tokenChipClassnames = [
        'costered-blocks--token',
        isExpanded && 'is-expanded',
        tokenTypeClass,
    ].filter(Boolean).join(' ');

    const tokenEditorClassnames = [
        'costered-blocks--token--panel',
        'costered-blocks--token--panel-inline',
        tokenTypeClass,
    ].filter(Boolean).join(' ');

    const handleRemove = useCallback((event: ReactMouseEvent) => {
        event.stopPropagation();
        onRemove(tokenId);
    }, [tokenId, onRemove]);

    const openFromPointer = useCallback(() => {
        lastOpenReasonRef.current = 'pointer';
        onToggle();
    }, [onToggle]);

    const openFromKeyboard = useCallback(() => {
        lastOpenReasonRef.current = 'keyboard';
        onToggle();
    }, [onToggle]);

    const handleChipKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFromKeyboard();
        } else if (event.key === 'Escape' && isExpanded) {
            event.preventDefault();
            onToggle();
        }
    }, [openFromKeyboard, isExpanded, onToggle]);

    const handleFocusOutside = useCallback((event: FocusEvent) => {
        const next = event?.relatedTarget as Node | null;
        if (next && chipRef.current?.contains(next)) { 
            return
        }
        event.stopPropagation();
    }, []);

    const EditorPanel = (
        <div id={`costered-blocks--token--panel-${index}`} className={tokenEditorClassnames}>
            <TextControl
                className="costered-blocks--token-editor--edit-input"
                ref={setInputRef}
                value={value ?? ''}
                placeholder={emptyPlaceholder ?? ''}
                onChange={(next?: string) => onChange(index, next ?? '')}
                onBlur={(event: any) => onChange(index, event?.target?.value ?? '')}
                onKeyDownCapture={(event: any) => event.stopPropagation()} // prevent outer handlers (e.g. esc to close modal)
                __nextHasNoMarginBottom
                __next40pxDefaultSize
            />
            <div className="costered-blocks--token--actions">
                <Tooltip text={labelData.moveLeft}>
                    <Button
                        icon="arrow-left-alt2"
                        onClick={() => onMoveLeft(tokenId)}
                        label={labelData.moveLeft}
                        variant="tertiary"
                    />
                </Tooltip>
                <Tooltip text={labelData.moveRight}>
                    <Button
                        icon="arrow-right-alt2"
                        onClick={() => onMoveRight(tokenId)}
                        label={labelData.moveRight}
                        variant="tertiary"
                    />
                </Tooltip>
                <Tooltip text={labelData.duplicate}>
                    <Button
                        icon={<BxCopy />}
                        onClick={() => onDuplicate(tokenId)}
                        label={labelData.duplicate}
                        variant="tertiary"
                    />
                </Tooltip>
            </div>
        </div>
    );

    return (
        <div className={tokenChipClassnames}>
            {/* collapsed “chip” header */}
            <div className="costered-blocks--token--chip" ref={chipRef}>
                <button
                    type="button"
                    className="costered-blocks--token--chip-button"
                    aria-expanded={isExpanded}
                    aria-controls={`costered-blocks--token--panel-${index}`}
                    onClick={openFromPointer}
                    onKeyDown={handleChipKeyDown}
                    title={isExpanded ? labelData.collapse : labelData.expand}
                >
                    <span className="costered-blocks--token--chip-text">{chipText}</span>
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

            {!floatingEditor && isExpanded && EditorPanel}

            {/* Floating panel (opt-in) */}
            {floatingEditor && chipRef.current && (
                <Popover
                    className="costered-blocks--token--popover"
                    anchor={chipRef.current}
                    placement={popoverPlacement} // e.g. 'bottom-start', 'right-start'
                    onClose={() => onToggle()}
                    focusOnMount="firstElement"
                    onFocusOutside={handleFocusOutside}
                    expandOnMobile
                >
                    {isExpanded && (
                        <div
                            className="costered-blocks--token--popover-inner"
                            style={popoverWidth ? { width: popoverWidth } : undefined}
                        >
                            {EditorPanel}
                        </div>
                    )}
                </Popover>
            )}
        </div>
    );
}