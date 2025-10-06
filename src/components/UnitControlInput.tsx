import { __experimentalUnitControl as UnitControl } from '@wordpress/components';
import type { CSSProperties } from 'react';

import { maybeFormat } from "@utils/componentUtils";

type Props = {
    id?: string | null;
    value: string | number;
    onChange: (value: string | number) => void;
    label?: string;
    className?: string;
    style?: CSSProperties;
};

export default function UnitControlInput({ id = null, value, onChange, label, className, style }: Props) {
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
            onChange={(next: unknown) => onChange?.(String(next ?? ''))}
            placeholder="0"
            style={{ padding: '0 2px', ...(style || {}) }}
            className={className}
            units={allowedUnits as unknown as any}
            isResettable
            allowReset
        />
    );
}