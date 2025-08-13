import { __, isRTL } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

import { DefaultIcon } from '@components/Icons';

export default function CustomSelectControl({ value, onChange, options, label = "" }) {
    const [open, setOpen] = useState(false);
    const selected = options.find(opt => opt.value === value || (!opt.value && !value));

    const DefaultText = __('default / unset', 'costered-blocks');
    const DefaultOption = isRTL() ? (
        <><span>{DefaultText}</span><DefaultIcon /></>
    ) : (
        <><DefaultIcon /><span>{DefaultText}</span></>
    );

    const newOptions = [
        { value: "", content: DefaultText, icon: DefaultIcon },
        ...options
    ];
    return (
        <div style={wrapperStyle}>
            {label && <label style={labelStyle}>{label}</label>}
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
                style={buttonStyle}
            >
                {selected ? (
                    isRTL() ? (
                        <>
                            <span>{selected.content}</span>
                            {selected?.altIcon || selected.icon || <DefaultIcon />}
                        </>
                    ) : (
                        <>
                            {selected.icon || <DefaultIcon />}
                            <span>{selected.content}</span>
                        </>
                    )
                ) : DefaultOption }
                <span style={arrowStyle}>▼</span>
            </button>
            {open && (
                <ul
                    role="listbox"
                    tabIndex={-1}
                    style={listStyle}
                >
                    {newOptions.map(opt => (
                        <li
                            key={opt.value}
                            role="option"
                            aria-selected={value === opt.value}
                            tabIndex={0}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            onKeyDown={e => {
                                if (e.key === "Enter" || e.key === " ") {
                                    onChange(opt.value);
                                    setOpen(false);
                                }
                            }}
                            style={{
                                ...listItemStyle,
                                background: value === opt.value ? "#f0f0f0" : "#fff",
                            }}
                        >
                            {isRTL() ? (
                                <>
                                    <span>{ opt.content }</span>
                                    { opt?.altIcon || opt.icon }
                                </>
                            ) : (
                                <>
                                    {opt.icon}
                                    <span>{opt.content}</span>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}


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
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    cursor: "pointer"
};