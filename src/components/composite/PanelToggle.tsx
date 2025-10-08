import type { ComponentType, ReactNode, ReactElement } from 'react';
import React, { memo, useCallback, useEffect, Children } from '@wordpress/element';
import { Flex, FlexBlock } from '@wordpress/components';

import { LABELS } from '@labels';
import CustomToggleGroup from '@components/CustomToggleGroup';
import type { GridControlsPanelMap, GridControlsPanelProps } from '@types';

type PanelToggleBaseProps<Key extends string> = {
    value: Key | null;
    onChange?: (next: Key | null) => void;
    panels: GridControlsPanelMap<Key>;
    panelProps?: GridControlsPanelProps<Key>;
    label?: ReactNode;
    forceActive?: boolean;
    className?: string;
    children?: ReactNode;
} & Record<string, unknown>;

function PanelToggleBase<Key extends string>({
    value,
    onChange,
    panels,
    panelProps = {},
    label = LABELS.panelToggle.label,
    forceActive = false,
    className,
    children,
    ...rest
}: PanelToggleBaseProps<Key>) {

    // Extract child values to determine available panels
    // We will always have one panel showing, and panels cannot be deselected
    const childValues = Children.toArray(children)
        .map((node: any) => node?.props?.value)
        .filter((val): val is Key => typeof val === 'string' && val.length > 0);

    const panelKeys: readonly Key[] = 
    (childValues.length > 0 ? childValues : (Object.keys(panels || {}) as Key[]));
    const firstKey: Key | null = panelKeys[0] ?? null;

    useEffect(() => {
        if (!panelKeys.length) return; // nothing to select
        if (!value || !panelKeys.includes(value)) {
            onChange?.(firstKey);
        }
    }, [value, firstKey, JSON.stringify(panelKeys)]);

    // Handle change, respecting forceActive
    const handleChange = useCallback(
        (next: Key | null | undefined) => {
            const nextValue: Key | null = (next ?? null) as Key | null;
            if (forceActive && nextValue === null) return;
            onChange?.(nextValue);
        },
        [onChange, forceActive]
    );

    const ActiveComponent: ComponentType<any> | null = value ? panels?.[value] : null;
    const resolvedProps =
        typeof panelProps === 'function'
            ? (value ? (panelProps as (k: Key) => Record<string, unknown>)(value) : {})
            : panelProps;

    return (
        <Flex direction="column" gap={2} className={className} {...rest}>
            <CustomToggleGroup
                label={label}
                value={(value ?? '') as string}
                onChange={handleChange as (v: string | null | undefined) => void}
            >
                {children}
            </CustomToggleGroup>
            {ActiveComponent ? (
                <FlexBlock>
                    <React.Suspense fallback={null}>
                        <ActiveComponent {...resolvedProps} />
                    </React.Suspense>
                </FlexBlock>
            ) : null}
        </Flex>
    );
}

const PanelToggleInner = memo(PanelToggleBase) as <Key extends string>(
    props: PanelToggleBaseProps<Key>
) => ReactElement;

type PanelToggleComponent = typeof PanelToggleInner & {
    TextOption: typeof CustomToggleGroup.TextOption;
    IconOption: typeof CustomToggleGroup.IconOption;
    CombinedOption: typeof CustomToggleGroup.CombinedOption;
};

const PanelToggle = PanelToggleInner as PanelToggleComponent;
PanelToggle.TextOption = CustomToggleGroup.TextOption;
PanelToggle.IconOption = CustomToggleGroup.IconOption;
PanelToggle.CombinedOption = CustomToggleGroup.CombinedOption;

export default PanelToggle;