import { __experimentalUnitControl as UnitControl } from '@wordpress/components';
import type { ComponentProps, CSSProperties } from 'react';

import { maybeFormat } from "@utils/common";

type BaseProps = {
    label?: string;
    value: string | number;
    onChange: (value: string | number) => void;
    id?: string | null;
    placeholder?: string;
    className?: string;  
} & Record<string, unknown>;

type UnderlyingOnChange = (next: string | number | undefined) => void;

export default function UnitControlInput({
    label, 
    value, 
    onChange, 
    id = null,
    placeholder = '',
    allowReset,
    className,
    ...rest
}: BaseProps) {
    const handleChange: UnderlyingOnChange = (next) => {
        const s = next == null ? '' : String(next);
        onChange(s);
    }

    const formattedLabel = maybeFormat(label, { toCapitalFirst: true, trim: true, toSpaces: true });

    const allowedUnits = [
        { name: 'rem', value: 'rem', label: 'rem' },
        { name: 'px', value: 'px', label: 'px' },
        { name: 'em', value: 'em', label: 'em' },
        { name: '%', value: '%', label: '%' },
        { name: 'vw', value: 'vw', label: 'vw' },
        { name: 'vh', value: 'vh', label: 'vh' }
    ] as const;

    return (
        <UnitControl
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            id={id || undefined}
            label={formattedLabel}
            value={value as any}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            units={allowedUnits as unknown as ComponentProps<typeof UnitControl>['units']}
            isResettable={allowReset}
            onReset={allowReset ? () => onChange('') : undefined}
            {...rest}
        />
    );
}