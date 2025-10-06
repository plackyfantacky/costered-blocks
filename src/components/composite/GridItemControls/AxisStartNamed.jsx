import { ComboboxControl } from '@wordpress/components';
import { isIntToken } from '@utils/gridPlacement';

export default function AxisStartNamed({ label, help, value, options, onChange, disabled }) {
    return (
        <ComboboxControl
            label={label}
            value={!isIntToken(value) ? (value ?? '') : ''}
            options={options.map((line) => ({ label: line, value: line }))}
            onChange={onChange}
            allowReset
            disabled={disabled}
            help={help}
            __nextHasNoMarginBottom
            __next40pxDefaultSize
        />
    );
}