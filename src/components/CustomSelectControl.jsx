import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

export default function CustomSelectControl({ value, onChange, options, label = "" }) {
    const [open, setOpen] = useState(false);
    const selected = options.find(opt => opt.value === value || (!opt.value && !value));

    const DefaultOption = (
        <>
            {/* material-symbols:remove-selection-rounded (Material Design Icons / license: Apache 2.0) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                <path fill="currentColor" d="m16.075 17.475l-3.25 3.25q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l3.25-3.25l-3.25-3.25q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.25 3.25l3.25-3.25q.275-.275.7-.275t.7.275t.275.7t-.275.7l-3.25 3.25l3.25 3.25q.275.275.275.7t-.275.7t-.7.275t-.7-.275zM4 5q-.425 0-.712-.288T3 4t.288-.712T4 3t.713.288T5 4t-.288.713T4 5m4 0q-.425 0-.712-.288T7 4t.288-.712T8 3t.713.288T9 4t-.288.713T8 5m4 0q-.425 0-.712-.288T11 4t.288-.712T12 3t.713.288T13 4t-.288.713T12 5m4 0q-.425 0-.712-.288T15 4t.288-.712T16 3t.713.288T17 4t-.288.713T16 5m4 0q-.425 0-.712-.288T19 4t.288-.712T20 3t.713.288T21 4t-.288.713T20 5M8 21q-.425 0-.712-.288T7 20t.288-.712T8 19t.713.288T9 20t-.288.713T8 21M4 9q-.425 0-.712-.288T3 8t.288-.712T4 7t.713.288T5 8t-.288.713T4 9m0 4q-.425 0-.712-.288T3 12t.288-.712T4 11t.713.288T5 12t-.288.713T4 13m0 4q-.425 0-.712-.288T3 16t.288-.712T4 15t.713.288T5 16t-.288.713T4 17m0 4q-.425 0-.712-.288T3 20t.288-.712T4 19t.713.288T5 20t-.288.713T4 21M20 9q-.425 0-.712-.288T19 8t.288-.712T20 7t.713.288T21 8t-.288.713T20 9"></path>
            </svg>
            <span>{__('default', 'costered-blocks')}</span>
        </>
    );

    const newOptions = [
        { value: "", content: DefaultOption },
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
                {selected ? selected.content : DefaultOption }
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
                            {opt.content}
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
    fontWeight: 600,
    marginBottom: 4
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