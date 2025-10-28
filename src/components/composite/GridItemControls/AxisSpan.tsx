import type { ReactNode } from "react";
import { useRef } from '@wordpress/element';

import NumberControlInput from '@components/NumberControlInput';
import { toInt, handleSpanChangeSkippingZero } from '@utils/gridPlacement';

type Props = {
    label: ReactNode;
    help?: ReactNode;
    value: string | number | undefined;
    cap?: number ;
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

    const lastRef = useRef<number>(toInt(value, 1));

    const handleChange = (next: number | '') => {
        if (next === '') return onChange(1);
        const result = handleSpanChangeSkippingZero(next, lastRef, cap ?? Number.MAX_SAFE_INTEGER);
        onChange(result);
    };

    const max = Number.isFinite(cap) ? Math.abs(cap as number) : undefined;
    const maxProps = max ? { min: -max, max } : {};

    return (
        <NumberControlInput
            label={label}
            value={displayValue}
            onChange={handleChange}
            isDragEnabled
            disabled={disabled}
            help={help}
            {...maxProps}
        />
    );
}