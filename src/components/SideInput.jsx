import { __experimentalUnitControl as UnitControl, FlexItem, TextControl } from '@wordpress/components';

export default function SideInput({ value, onChange, label, placeholder }) {
    return (
        <FlexItem>
            <UnitControl
                label={label}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{ padding: '0 2px' }}
            />
        </FlexItem>
    );
}