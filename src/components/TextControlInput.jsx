import { FlexItem, TextControl } from '@wordpress/components';

export default function TextControlInput({ value, onChange, label, placeholder }) {
    return (
        <FlexItem>
            <TextControl
                __next40pxDefaultSize
                label={label}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{ padding: '0 2px' }}
            />
        </FlexItem>
    );
}