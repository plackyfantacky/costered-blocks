import { FlexItem, TextControl } from '@wordpress/components';

export default function SideInput({ value, onChange, placeholder }) {
    return (
        <FlexItem>
            <TextControl
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                label={placeholder}
                style={{ textAlign: 'center', margin: 0, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 2 }}
            />
        </FlexItem>
    );
}