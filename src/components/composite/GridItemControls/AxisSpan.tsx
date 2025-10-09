import type { ReactNode } from "react";
import NumberControlInput from '@components/NumberControlInput';
import { toInt } from '@utils/gridPlacement';

type Props = {
    label: ReactNode;
    help?: ReactNode;
    value: string | number | undefined;
    cap?: number;
    onChange: (value: number) => void;
    disabled?: boolean;
};

export default function AxisSpan({
    label,
    help,
    value,
    cap,
    onChange,
    disabled = false
}: Props) {
    const displayValue = toInt(value, 1);

    const handleChange = (next: number | '') => {
        if (next === '') {
            onChange(1);
            return;
        }
        onChange(next);
    };

    const maxProps = Number.isFinite(cap as number) ? { max: cap as number } : {};

    return (
        <NumberControlInput
            label={label}
            value={displayValue}
            onChange={handleChange}
            min={1}
            {...maxProps}
            isDragEnabled
            disabled={disabled}
            help={help}
        />
    );
}