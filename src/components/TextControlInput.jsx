import { TextControl } from '@wordpress/components';

export default function TextControlInput({ value, onChange, label, placeholder }) {
    const formattedLabel = label.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return (
        <div style={{ padding: '0 2px' }}>
            <TextControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                label={formattedLabel}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );
}