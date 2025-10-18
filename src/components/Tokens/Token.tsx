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
    index: number;
    value: string;
    isExpanded: boolean;
    onToggle: (index: number, nextExpanded: boolean) => void;
    onRemove: (index: number) => void;
    onChange: (index: number, nextValue: string) => void;
    onMoveLeft: (index: number) => void;
    onMoveRight: (index: number) => void;
    onDuplicate: (index: number) => void;
    labels?: Labels;
    typeClass?: string | null;
    emptyPlaceholder?: string;
    floatingEditor?: boolean;
    popoverPlacement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
    popoverWidth?: number | string; // e.g. 300 or '20em'
};

export default function Token({
    index,
    value,
    isExpanded,
    onToggle,
    onRemove,
    onChange,
    onMoveLeft,
    onMoveRight,
    onDuplicate,
    labels,
    typeClass = null,
    emptyPlaceholder,
    floatingEditor = false,
    popoverPlacement = 'bottom-start',
    popoverWidth,
}: Props) {
    // Ref to the chip button, used as anchor for the popover (if floatingEditor)
    const chipRef = useRef<HTMLDivElement | null>(null);
    
    // Manage focus on the input when expanded
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
        // Only manage focus when expanded and the input is present
        if (!isExpanded || !inputElementRef.current) return;

        if (lastOpenReasonRef.current === 'keyboard') {
            const element = inputElementRef.current;
            element.focus?.({ preventScroll: true });

            const len = typeof element.value === 'string' ? element.value.length : 0;
            if (typeof element.setSelectionRange === 'function') element.setSelectionRange(len, len);
        }
        // reset; subsequent opens without an explicit reason default to 'pointer'
        lastOpenReasonRef.current = 'pointer';
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

    const handleRemove = useCallback((event: ReactMouseEvent) => {
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

    const handleChipKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFromKeyboard();
        } else if (event.key === 'Escape' && isExpanded) {
            event.preventDefault();
            onToggle(index, false);
        }
    }, [openFromKeyboard, index, isExpanded, onToggle]);

    const tokenTypeClass = (typeClass !== null && typeClass !== undefined) ? `costered-blocks--token--type-${typeClass}` : '';
    
    const tokenChipClassnames = ['costered-blocks--token ', isExpanded ? 'is-expanded ' : '', tokenTypeClass].join('').trimEnd();
    const tokenEditorClassnames = ['costered-blocks--token--panel ', 'costered-blocks--token--panel-inline ', tokenTypeClass].join('').trimEnd();

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
                <Tooltip text={labelData.duplicate}>
                    <Button
                        icon={<BxCopy />}
                        onClick={() => onDuplicate(index)}
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
            {/* Inline panel (current behaviour) */}
            {!floatingEditor && isExpanded && EditorPanel}

            {/* Floating panel (opt-in) */}
            {floatingEditor && isExpanded && chipRef.current && (
                <Popover
                    className="costered-blocks--token--popover"
                    anchor={chipRef.current}
                    placement={popoverPlacement} // e.g. 'bottom-start', 'right-start'
                    onClose={() => onToggle(index, false)}
                    focusOnMount="firstElement"
                    onFocusOutside={(event: any) => event.preventDefault()}
                    expandOnMobile
                >
                    <div
                        className="costered-blocks--token--popover-inner"
                        style={popoverWidth ? { width: popoverWidth } : undefined}
                    >
                        {EditorPanel}
                    </div>
                </Popover>
            )}
        </div>
    );
}
