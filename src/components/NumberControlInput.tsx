import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { useCallback } from "@wordpress/element";
import type { ReactNode } from "react";

import { maybeFormat } from "@utils/componentUtils";

type NumberControlInputProps = {
    value: number | '';
    onChange: (value: number | '') => void;
    label?: ReactNode | string;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    asInteger?: boolean;
    clamp?: boolean;
    [extraProps: string]: unknown;
}

export default function NumberControlInput({ 
    value, 
    onChange, 
    label, 
    placeholder,
    min = 2, 
    max = 100, 
    step = 1,
    asInteger = false,
    clamp = true,
    ...rest
} : NumberControlInputProps) {
    const formattedLabel = maybeFormat(label as string, { toDashes: true, toSpaces: false });

    const displayValue: string | number | undefined =  value === '' ? '' : value;

    const handleChange = useCallback(
        (next: string | number | undefined) => {
            if (next === '' || next === undefined || next === null) {
                onChange(''); //signal to unset the attribute
                return;
            }

            const raw = typeof next === 'number' ? String(next) : next;
            let n = asInteger ? parseInt(raw, 10) : parseFloat(raw);
            
            if (Number.isNaN(n)) {
                onChange('');
                return;
            }
            if (clamp) {
                if (typeof min === 'number' && n < min) n = min;
                if (typeof max === 'number' && n > max) n = max;
            }
            onChange(n);
        },
        [onChange, min, max, asInteger, clamp]
    );

    return (
        <div style={{ padding: '0 2px' }}>
            <NumberControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                isBlock
                label={formattedLabel}
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                {...rest}
            />
        </div>
    );
}