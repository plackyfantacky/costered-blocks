import type { ComponentProps } from '@wordpress/element';
import UnitControlInput from '@components/UnitControlInput';
import TextControlInput from '@components/TextControlInput';
import { useBreakpointState } from "@hooks";

import type { MeasurementMode } from '@types';

type UnitProps = ComponentProps<typeof UnitControlInput>;
type TextProps = ComponentProps<typeof TextControlInput>;

/* common props shared by both controlled and breakpoint-aware modes. */
type CommonProps = {
    mode: MeasurementMode;
    label: string;
    allowReset?: boolean;
    // Extra props forwarded to the inner UnitControlInput (except value/onChange/label).
    unitProps?: Omit<Partial<UnitProps>, 'value' | 'onChange' | 'label'>;
    // Extra props forwarded to the inner TextControlInput (except value/onChange/label).
    textProps?: Omit<Partial<TextProps>, 'value' | 'onChange' | 'label'>;
};

// controlled mode: existing behaviour. caller owns value + onChange.
type ControlledProps = CommonProps & {
    value: string;
    onChange: (value: string) => void;
    clientId?: never;
    prop?: never;
    commitOn?: never;
    parse?: never;
    serialise?: never;
};

/**
 * breakpoint-aware mode: the component manages value/onChange using useBreakpointState.
 * caller provides clientId + prop instead of value + onChange.
 */
type BpAwareProps = CommonProps & {
    clientId: string;
    prop: string;
    commitOn?: 'blur' | 'change';
    parse?: (value: unknown) => string;
    serialise?: (value: string) => unknown;

    value?: never;
    onChange?: never;
};

type Props = ControlledProps | BpAwareProps;

/**
 * CSSMeasurementControl: switches between UnitControlInput and TextControlInput.
 * accepts a minimal, shared prop surface; forwards any extra props to the underlying input.
 */
export default function CSSMeasurementControl(props: Props) {
    const {
        mode, 
        label, 
        allowReset, 
        unitProps = {}, 
        textProps = {} 
    } = props;

    const isBreakpointAware = 'clientId' in props && 'prop' in props;

    // derive the bound value/handlers for each mode.
    // in controlled mode, we just forward what we were given.
    // in bp-aware mode, we use useBreakpointState to manage draft/commit.
    if (mode === 'unit') {
        if (isBreakpointAware) {
            const {
                clientId,
                prop,
                commitOn = 'blur',
            } = props as BpAwareProps;

            const { bind } = useBreakpointState<string | number>(clientId, prop, {
                commitOn,
                parse: (value): string | number => (
                    typeof value === 'number' ? value : (value == null ? '' : String(value))
                ),
                serialise: (value) => value
            });

            // thread per-bp key + focus/blur into the inner control so it remounts on bp switch
            const mergedUnitProps: Partial<UnitProps> = {
                ...unitProps,
                onFocus: bind.onFocus,
                onBlur: bind.onBlur
            }

            return (
                <UnitControlInput
                    key={bind.key}
                    label={label}
                    value={bind.value}
                    onChange={bind.onChange}
                    {...(allowReset !== undefined ? { allowReset } : {})}
                    {...mergedUnitProps}
                />
            );
        }

        const {
            value,
            onChange
        } = props as ControlledProps;

        const handleChange: UnitProps['onChange'] = (next: string | number) => {
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

    // text mode
    if (isBreakpointAware) {
        const {
            clientId,
            prop,
            commitOn = 'blur',
            parse = (value: unknown) => (typeof value === 'string' ? value : String(value ?? '')),
            serialise = (value: string) => value
        } = props as BpAwareProps;

        const { bind } = useBreakpointState<string>(clientId, prop, {
            commitOn,
            initialFallback: '',
            parse,
            serialise
        });

        // thread per-bp key + focus/blur into the inner control so it remounts on bp switch
        const mergedTextProps: Partial<TextProps> = {
            ...textProps,
        };

        return (
            <div
                key={bind.key}
                onFocus={bind.onFocus}
                onBlur={bind.onBlur}
            >
                <TextControlInput
                    key={bind.key}
                    label={label}
                    value={bind.value}
                    onChange={bind.onChange as (next: string) => void}
                    {...(allowReset !== undefined ? { allowReset } : {})}
                    {...mergedTextProps}
                />
            </div>
        );
    }

    // controlled text mode
    const {
        value,
        onChange
    } = props as ControlledProps;

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