import { TextControl } from '@wordpress/components';

import { maybeFormat } from "@utils/componentUtils";

export default function TextControlInput({ value, onChange, label, placeholder = "", help = "" }) {
    const formattedLabel = maybeFormat(label, { toDashes: true, toSpaces: false });
    
    return (
        <div style={{ padding: '0 2px' }}>
            <TextControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                label={formattedLabel}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                help={help}
            />
        </div>
    );
}