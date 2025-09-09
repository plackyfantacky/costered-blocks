import { isRTL } from '@wordpress/i18n';
import { useState, useEffect, useRef, createContext, useContext, useMemo, Children } from '@wordpress/element';
import { Flex, FlexItem } from '@wordpress/components';

import { LABELS } from "@labels";

const Ctx = createContext();

export function CustomSelectControl({
    value,
    onChange,
    label = "",
    className = "",
    children
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if(!open) return;
        const onDocDown = (e) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('pointerdown', onDocDown, true);
        return () => document.removeEventListener('pointerdown', onDocDown, true);
    }, [open]);

    const selectAndClose = useMemo(() => (next) => {
        onChange(next);
        setOpen(false);
    }, [onChange]);

    const ctxValue = useMemo(() => ({ value, onSelect: selectAndClose }), [value, selectAndClose]);

    const DefaultText = LABELS.customSelectControl.defaultText;

    const getSelectedVisual = () => {
        let icon;
        let labelNode = DefaultText;
        const arr = Children.toArray(children);
        for (let i = 0; i < arr.length; i++) {
            const el = arr[i];
            if (el?.props?.value === value) {
                //Child items of this component may or may not include an icon. e.g.
                // <SelectControl.Option value=""><DefaultIcon />{__('unset / initial', 'costered-blocks')}</SelectControl.Option
                // or
                // <SelectControl.Option value="simple">{__('Simple', 'costered-blocks')}</SelectControl.Option>
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
    };

    const { icon, labelNode } = getSelectedVisual();

    return (
        <Ctx.Provider value={ctxValue}>
            <div ref={rootRef} style={wrapperStyle}>
                {label && <label style={labelStyle}>{label}</label>}
                <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    onClick={() => setOpen(o => !o)}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown' && !open) setOpen(true);
                        if (e.key === 'Escape' && open) setOpen(false);
                    }}
                    className="costered-custom-select__button"
                    style={buttonStyle}
                >
                    <Flex direction={isRTL() ? "row-reverse" : "row"} align="center" gap={8}>
                        <FlexItem isBlock style={selectedOptionStyle}>
                            {icon}
                            <span>{labelNode}</span>
                        </FlexItem>
                        <span style={arrowStyle}>▼</span>
                    </Flex>
                </button>

                {open && (
                    <ul
                        role="listbox"
                        tabIndex={-1}
                        className={`costered-custom-select__list ${className || ''}`}
                        style={listStyle}
                    >
                        {children}
                    </ul>
                )}
            </div>
        </Ctx.Provider>
    );
}

const Option = React.memo(function Option({ value, children, className = "", ...rest }) {
    const { value: current, onSelect} = useContext(Ctx) || {};
    const isSelected = value === current || (!value && !current);

    const activate = () => onSelect?.(value);

    return (
        <li
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            className={`costered-custom-select__list-item ${className}`}
            style={{ ...listItemStyle, ...(isSelected ? selectedOptionStyle : null) }}
            onClick={activate}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    activate();
                }
            }}
            {...rest}
        >
            <div style={listItemInnerStyle}>
                {children ?? String(value ?? '')}
            </div>
        </li>
    );
});

CustomSelectControl.Option = Option;


const wrapperStyle = {
    position: "relative",
    flex: 1,
    minWidth: 180
};

const labelStyle = {
    display: "block",
    marginBottom: 4,
    fontSize: "0.875em",
    fontWeight: 500,
    textTransform: "uppercase",
};

const buttonStyle = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "8px 12px",
    fontSize: "1em",
    border: "1px solid #949494",
    borderRadius: 4,
    background: "#fff",
    cursor: "pointer",
    gap: 8
};

const selectedOptionStyle = {
    display: "flex",
    flexDirection: isRTL() === true ? "row-reverse" : "row",
    alignItems: "center",
    gap: 8,
    flexGrow: 1,
    color: "#333"
};

const arrowStyle = {
    marginLeft: "auto",
    color: "#888"
};

const listStyle = {
    position: "absolute",
    top: "100%",
    left: 0,
    zIndex: 10,
    width: "100%",
    margin: 0,
    padding: 0,
    background: "#fff",
    border: "1px solid #dcdcde",
    borderRadius: 4,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    listStyle: "none",
    maxHeight: 240,
    overflowY: "auto"
};

const listItemStyle = {
    display: "flex",
    flexDirection: isRTL() === true ? "row-reverse" : "row",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    cursor: "pointer"
};

const listItemInnerStyle = {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexDirection: isRTL() ? 'row-reverse' : 'row'
}