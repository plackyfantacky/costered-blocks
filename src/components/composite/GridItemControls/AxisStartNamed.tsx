import type { ReactNode } from '@wordpress/element';
import { ComboboxControl } from '@wordpress/components';
import { isIntToken } from '@utils/gridPlacement';

type Props = {
    label: ReactNode;
    help?: ReactNode;
    value: string | number | undefined;
    options: readonly string[];
    onChange: (value: string) => void;
    disabled?: boolean;
};

export default function AxisStartNamed({
    label,
    help,
    value,
    options,
    onChange,
    disabled = false,
}: Props) {
    const displayValue = !isIntToken(value) ? String(value ?? '') : '';

    return (
        <ComboboxControl
            label={label}
            value={displayValue}
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