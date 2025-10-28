import type { ReactNode } from 'react';
import NumberControlInput from '@components/NumberControlInput';
import { isIntToken, toInt } from '@utils/gridPlacement';

const maxInteger = Number.MAX_SAFE_INTEGER;

type Props = {
    label: ReactNode;
    help?: ReactNode | string | undefined;
    value: string | number | undefined;
    onChange: ( next: number ) => void;
    disabled?: boolean;
}

export default function AxisStartNumber({ 
    label,
    help = '',
    value,
    onChange,
    disabled
}: Props) {
    const displayValue = isIntToken(value) ? toInt(value, 1) : 1;

    const handleChange = ( next: number | '' ) => {
        if ( next === '' || Number.isNaN(next as number )) {
            onChange(1);
            return;
        }
        onChange(next as number);
    }

    return (
        <NumberControlInput
            label={label}
            help={help}
            value={displayValue}
            onChange={handleChange}
            min={-maxInteger} // allow negatives (and 0) for auto-flow semantics
            disabled={disabled}
        />
    );
}
