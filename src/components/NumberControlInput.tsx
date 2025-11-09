import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { useCallback } from "@wordpress/element";
import type { ReactNode } from '@wordpress/element';

import { maybeFormat } from "@utils/common";

type NumberControlInputProps = {
    value: number | '';
    onChange: (value: number | '') => void;
    label?: ReactNode | string;
    help?: ReactNode | string | undefined;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    asInteger?: boolean;
    clamp?: boolean;
    [extraProps: string]: unknown;
}

type InferProps<C> = C extends React.ComponentType<infer P> ? P : never;
type WPNumberControlProps = InferProps<typeof NumberControl>;
type UnderlyingOnChange = WPNumberControlProps extends { onChange: infer H }
    ? NonNullable<H>
    : (next: string | number | undefined) => void;

export default function NumberControlInput({ 
    value, 
    onChange, 
    label,
    help = '',
    placeholder,
    min = 2, 
    max = 100, 
    step = 1,
    asInteger = false,
    clamp = true,
    ...rest
}: NumberControlInputProps) {
    const formattedLabel = maybeFormat(label as string, { toDashes: false, toSpaces: false }) || undefined;
    const formattedHelp = maybeFormat(help as string, { toDashes: false, toSpaces: false }) || undefined;

    const displayValue: string | number | undefined =  value === '' ? '' : value;

    const handleChange:UnderlyingOnChange = useCallback((next) => {
        if (next === '' || next === null) {
            onChange(''); //signal to unset the attribute
            return;
        }

        if (typeof next === 'number') {
            let num = asInteger ? Math.trunc(next) : next;
            
            if (clamp) {
                if (Number.isFinite(min) && num < (min as number)) num = min as number;
                if (Number.isFinite(max) && num > (max as number)) num = max as number;
            }
            onChange(num);
            return;
        }

        if ( typeof next === 'string' ) {
            const str = next.trim();
            const parsed = asInteger ? parseInt(str, 10) : parseFloat(str);
            if (!Number.isFinite(parsed)) {
                // not a valid number
                onChange('');
                return;
            }

            let num = asInteger ? Math.trunc(parsed) : parsed;
            if (clamp) {
                if (Number.isFinite(min) && num < (min as number)) num = min as number;
                if (Number.isFinite(max) && num > (max as number)) num = max as number;
            }
            onChange(num);
            return;
        }

        // unknown type
        onChange('');
    }, [onChange, min, max, asInteger, clamp] );

    return (
        <div style={{ padding: '0 2px' }}>
            <NumberControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                isBlock
                label={formattedLabel}
                value={displayValue}
                help={formattedHelp}
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