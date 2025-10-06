import { ComboboxControl, Notice } from '@wordpress/components';
import { isIntToken } from '@utils/gridPlacement';

export default function AxisEndNamed({
    label, help, value, options, onChange, hasNamed, mismatchNotice, disabled
}) {
    if (!hasNamed) {
        return <Notice status="info" isDismissible={false}>{mismatchNotice}</Notice>;
    }
    return (
        <ComboboxControl
            label={label}
            value={!isIntToken(value) && value !== 'auto' ? (value ?? '') : ''}
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
