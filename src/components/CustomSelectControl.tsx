import { isRTL } from '@wordpress/i18n';
import { useState, useCallback, useEffect, useRef, createContext, useContext, useMemo, Children, memo } from '@wordpress/element';
import { Flex, FlexItem } from '@wordpress/components';

import { LABELS } from "@labels";

type ToggleValue = string;

type SelectContextShape = {
    value: ToggleValue | undefined;
    onSelect: (value: ToggleValue) => void;
};

const Ctx = createContext<SelectContextShape | null>(null);

export interface CustomSelectControlProps {
    value: ToggleValue;
    onChange: (value: ToggleValue) => void;
    label?: React.ReactNode | string;
    className?: string;
    children: React.ReactNode;
}

const CustomSelectControlBase: React.FC<CustomSelectControlProps> = ({
    value,
    onChange,
    label = "",
    className = "",
    children
}) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const onDocDown = (event: PointerEvent) => {
            const root = rootRef.current;
            if (!root) return;
            const target = event.target as Node | null;
            if (target && !root.contains(target)) setOpen(false);
        };
        document.addEventListener('pointerdown', onDocDown, true);
        return () => document.removeEventListener('pointerdown', onDocDown, true);
    }, [open]);

    const selectAndClose = useCallback(
        (next: ToggleValue) => {
            onChange(next);
            setOpen(false);
        },
        [onChange]
    );

    const ctxValue = useMemo<SelectContextShape>(
        () => ({ value, onSelect: selectAndClose }),
        [value, selectAndClose]
    );

    const DefaultText = LABELS.customSelectControl.defaultText;

    const getSelectedVisual = useCallback((): { icon?: React.ReactNode; labelNode: React.ReactNode } => {
        let icon: React.ReactNode | undefined;
        let labelNode: React.ReactNode = DefaultText;
        const arr = Children.toArray(children) as Array<any>;
        for (let i = 0; i < arr.length; i++) {
            const el = arr[i];
            if (el?.props?.value === value) {
                const parts = Children.toArray(el.props.children);
                if (parts.length > 1) {
                    icon = parts[0] ?? icon;
                    labelNode = parts.slice(1)
                } else {
                    labelNode = parts[0] ?? DefaultText;
                }
                break;
            }
        }
        return { icon, labelNode };
    }, [children, value, DefaultText]);

    const { icon, labelNode } = getSelectedVisual();

    return (
        <Ctx.Provider value={ctxValue}>
            <div className="costered-blocks--custom-select costered-blocks--custom-select--wrapper" ref={rootRef}>
                {label ? <label className="costered-blocks--custom-select--label">{label}</label> : null}
                <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    onClick={() => setOpen(o => !o)}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown' && !open) setOpen(true);
                        if (e.key === 'Escape' && open) setOpen(false);
                    }}
                    className="costered-blocks--custom-select--button"
                >
                    <Flex
                        direction={isRTL() ? "row-reverse" : "row"}
                        align="center"
                        gap={8}
                        className="costered-blocks--custom-select--selected"
                    >
                        <FlexItem 
                            isBlock
                            className={`costered-blocks--custom-select--selected-inner ${isRTL() ? 'is-rtl' : ''}`}
                        >
                            {icon}
                            <span>{labelNode}</span>
                        </FlexItem>
                        <span className="costered-blocks--custom-select--arrow">▼</span>
                    </Flex>
                </button>

                {open && (
                    <ul
                        role="listbox"
                        tabIndex={-1}
                        className="costered-blocks--custom-select--list"
                    >
                        {children}
                    </ul>
                )}
            </div>
        </Ctx.Provider>
    );
}

export interface OptionProps extends React.LiHTMLAttributes<HTMLLIElement> {
    value: ToggleValue;
    className?: string;
    label?: string;
    children: React.ReactNode;
    disabled?: boolean;    
}

const Option = memo(function Option({
    value,
    children,
    className = "",
    label,
    disabled,
    ...rest
}: OptionProps) {
    const ctx = useContext(Ctx);
    const current = ctx?.value;
    const onSelect = ctx?.onSelect;

    const isSelected = value === current || (!value && !current);

    const activate = () => {
        if (disabled) return;
        onSelect?.(value);
    };

    return (
        <li
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            className={`costered-blocks--custom-select--list-item ${className} ${isSelected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
            onClick={activate}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    activate();
                }
            }}
            {...rest}
        >
            <Flex
                align="center"
                direction={isRTL() ? "row-reverse" : "row"} 
                className="costered-blocks--custom-select--list-item--inner"
            >
                <div className="costered-blocks--custom-select--list-item--label">
                    {children ?? String(value ?? '')}
                </div>
                {isSelected && (
                    <span className="costered-blocks--custom-select--list-item--checkmark">✔</span>
                )}
            </Flex>
        </li>
    );
});

const MemoSelect = memo(CustomSelectControlBase) as React.MemoExoticComponent<
    React.FC<CustomSelectControlProps>
>;

type CustomSelectControlComponent = React.FC<CustomSelectControlProps> & {
    Option: typeof Option;
};

const CustomSelectControl = Object.assign(MemoSelect, { Option }) as unknown as CustomSelectControlComponent;

export { CustomSelectControl };