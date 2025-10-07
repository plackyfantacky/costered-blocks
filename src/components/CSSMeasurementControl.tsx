import type { ComponentProps, ComponentPropsWithoutRef } from 'react';
import UnitControlInput from '@components/UnitControlInput';
import TextControlInput from '@components/TextControlInput';

import type { MeasurementMode } from '@types';

type UnitProps = ComponentProps<typeof UnitControlInput>;
type TextProps = ComponentProps<typeof TextControlInput>;

type BaseProps = {
    mode: MeasurementMode;
    label: string;
    value: string;
    onChange: (next: string) => void;
    allowReset?: boolean;
    unitProps?: Partial<UnitProps>;
    textProps?: Partial<TextProps>;
};

/**
 * CSSMeasurementControl: switches between UnitControlInput and TextControlInput.
 * Accepts a minimal, shared prop surface; forwards any extra props to the underlying input.
 */
export default function CSSMeasurementControl({
    mode,
    label,
    value,
    onChange,
    allowReset,
    unitProps ={},
    textProps = {},
}: BaseProps) {
    if (mode === 'unit') {
        const handleChange: UnitProps['onChange'] = (next) => {
            const asString = next == null ? '' : String(next);
            onChange(asString);
        };

        return (
            <UnitControlInput
                label={label}
                value={value}
                onChange={handleChange}
                {...(allowReset !== undefined ? { allowReset } : {})}
                {...unitProps}
            />
        );
    }

    const handleChange: TextProps['onChange'] = (next: string) => {
        onChange(next);
    };
    
    return (
        <TextControlInput
            label={label}
            value={value}
            onChange={handleChange}
            {...(allowReset !== undefined ? { allowReset } : {})}
            {...textProps}
        />
    );
}