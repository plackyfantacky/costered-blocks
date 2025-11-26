import type { ComponentProps } from '@wordpress/element';
import { RangeControl, __experimentalUnitControl as UnitControl, Flex, FlexBlock, FlexItem, BaseControl } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';

import { useBreakpointState } from "@hooks";

type UnitProps = ComponentProps<typeof UnitControl>;
type RangeProps = ComponentProps<typeof RangeControl>;

type CommonProps = {
    label: string;
    allowReset?: boolean;
    rangeProps?: Omit<Partial<RangeProps>, 'value' | 'onChange' | 'label'>;
    unitProps?: Omit<Partial<UnitProps>, 'value' | 'onChange' | 'label' | 'unit' | 'onUnitChange'>;
};

type ControlledProps = CommonProps & {
    value: string;
    onChange: (next: string) => void;
    clientId?: never;
    prop?: never;
    commitOn?: never;
}

type BpAwareProps = CommonProps & {
    clientId: string
    prop: string;
    commitOn?: 'blur' | 'change';
    value?: never;
    onChange?: never;
}

type Props = ControlledProps | BpAwareProps;

function parseMeasurement(input: unknown): {
    numeric: number | undefined;
    unit: string;
} {
    if (typeof input !== 'string') {
        return { numeric: undefined, unit: 'px' }   
    }

    const trimmed = input.trim();

    if(trimmed === '') {
        return { numeric: undefined, unit: 'px' } 
    }

    const numeric = parseFloat(trimmed);
    const unit = trimmed.replace(/[\d.\s]/g, '') || 'px';

    return { numeric: Number.isFinite(numeric) ? numeric : undefined, unit }
}

function normaliseToNumber(raw: unknown): number | undefined {
    if (typeof raw === 'number') {
        return Number.isFinite(raw) ? raw : undefined;
    }

    if (raw == null || raw === '') {
        return undefined;
    }

    const parsed = parseFloat(String(raw));
    return Number.isFinite(parsed) ? parsed : undefined;
}

const ControlInner = ({
    label,
    numeric,
    unit,
    setNumeric,
    setUnit,
    rangeProps,
    unitProps
}: {
    label: string;
    numeric: number | undefined;
    unit: string;
    setNumeric: (next: number | undefined) => void;
    setUnit: (next: string) => void;
    rangeProps: Record<string, unknown>;
    unitProps: Record<string, unknown>;
}) => {
    return (
        <BaseControl label={label} className="costered-blocks--css-measurement-slider">
            <Flex className="costered-blocks--css-measurement-slider--inner" direction="row" align="center" gap={4}>
                <div className="costered-blocks--css-measurement-slider--range-control-wrapper">
                    <RangeControl
                        value={numeric}
                        onChange={(next: any) => {
                            const normalised = normaliseToNumber(next);
                            setNumeric(normalised);
                        }}
                        withInputField={false}
                        __nextDefaultFontSize={true}
                        {...rangeProps}
                    />
                </div>
                <div className="costered-blocks--css-measurement-slider--unit-control-wrapper">
                    <UnitControl
                        value={numeric ?? ''}
                        onChange={(next: any) => {
                            // next can be number | string | undefined
                            const normalised = normaliseToNumber(next);
                            setNumeric(normalised);
                        }}
                    onUnitChange={(nextUnit: any) => setUnit(nextUnit)}

                        __nextDefaultFontSize={true}
                        {...unitProps}
                    />
                </div>
            </Flex>
        </BaseControl>
    )
} 

export function CSSMeasurementSlider(props: Props) {
    const {
        label, 
        rangeProps = {}, 
        unitProps = {}
    } = props;

    const isBreakpointAware = 'clientId' in props && 'prop' in props;

    /* Breakpoint-aware mode */
    if (isBreakpointAware) {
        const { clientId, prop, commitOn = 'blur' } = props as BpAwareProps;

        const { bind } = useBreakpointState<string>(clientId, prop, {
            commitOn,
            parse: (raw) => (typeof raw === 'string' ? raw : ''),
            serialise: (next) => next
        });

        const { numeric: parsedNumeric, unit: parsedUnit } = parseMeasurement(bind.value);

        const [numeric, setNumeric] = useState(parsedNumeric);
        const [unit, setUnit] = useState(parsedUnit);

        useEffect(() => {
            if (numeric == null) {
                bind.onChange('');
            } else {
                bind.onChange(`${numeric}${unit}`);
            }
        }, [numeric, unit]);

        return (
            <Flex direction="row" align="center" gap={8} key={bind.key} onFocus={bind.onFocus} onBlur={bind.onBlur}>
                <ControlInner
                    label={label}
                    numeric={numeric}
                    unit={unit}
                    setNumeric={setNumeric}
                    setUnit={setUnit}
                    rangeProps={rangeProps}
                    unitProps={unitProps}
                />
            </Flex>
        );
    }

    /* Controlled mode */
    const { value, onChange } = props as ControlledProps;

    const { numeric: parsedNumeric, unit: parsedUnit } = parseMeasurement(value);

    const [numeric, setNumeric] = useState(parsedNumeric);
    const [unit, setUnit] = useState(parsedUnit);

    useEffect(() => {
        if (numeric == null) {
            onChange('');
        } else {
            onChange(`${numeric}${unit}`);
        }
    }, [numeric, unit]);

    return (
        <Flex direction="row" align="center" gap={8}>
            <ControlInner
                label={label}
                numeric={numeric}
                unit={unit}
                setNumeric={setNumeric}
                setUnit={setUnit}
                rangeProps={rangeProps}
                unitProps={unitProps}
            />
        </Flex>
    );
}