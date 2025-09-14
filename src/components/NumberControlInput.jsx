import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { useCallback } from "@wordpress/element";

import { maybeFormat } from "@utils/componentUtils";

export default function NumberControlInput({ value, onChange, label, placeholder, min = 2, max = 100, step = 1, asInteger = false, clamp = true, ...rest }) {

    const formattedLabel = maybeFormat(label, { toDashes: true, toSpaces: false });
    const displayValue = value === '' || value === undefined ? '' : String(value);

    const handleChange = useCallback(
        (next) => {
            if (next === '' || next === undefined || next === null) {
                onChange(''); //signal to unset the attribute
                return;
            }
            let n = asInteger ? parseInt(next, 10) : parseFloat(next);
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