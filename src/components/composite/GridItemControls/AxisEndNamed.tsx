import type { ReactNode } from "react";
import { ComboboxControl, Notice } from '@wordpress/components';
import { isIntToken } from '@utils/gridPlacement';

type Props = {
    label?: ReactNode;
    help?: ReactNode;
    value: string | number | undefined;
    options: readonly string[];
    onChange: (value: string) => void;
    hasNamed: boolean;
    mismatchNotice: ReactNode;
    disabled?: boolean;
};

export default function AxisEndNamed({
    label,
    help,
    value,
    options,
    onChange,
    hasNamed,
    mismatchNotice,
    disabled = false,
}: Props) {
    if (!hasNamed) {
        return (
            <Notice status="info" isDismissible={false}>
                {mismatchNotice}
            </Notice>
        );
    }

    const current =
        !isIntToken(value) && value !== 'auto' ? String(value ?? '') : '';

    const handleChange = (next: string | undefined) => {
        onChange(String(next ?? ''));
    };

    return (
        <ComboboxControl
            label={label}
            value={current}
            options={options.map((line) => ({ label: line, value: line }))}
            onChange={handleChange}
            allowReset
            disabled={disabled}
            help={help}
            __nextHasNoMarginBottom
            __next40pxDefaultSize
        />
    );
}
