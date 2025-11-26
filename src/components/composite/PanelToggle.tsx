import type { ComponentType, ReactNode, ReactElement } from '@wordpress/element';
import { memo, useCallback, Children, Suspense } from '@wordpress/element';
import { Flex, FlexBlock } from '@wordpress/components';

import { LABELS } from '@labels';

import CustomToggleGroup from '@components/CustomToggleGroup';
import type { GridControlsPanelMap, GridControlsPanelProps } from '@types';

type PanelToggleBaseProps<Key extends string> = {
    value: Key; //controlled value, not-nullable
    onChange: (next: Key) => void; //controlled setter
    panels: GridControlsPanelMap<Key>;
    panelProps?: GridControlsPanelProps<Key>;
    label?: ReactNode;
    className?: string;
    children?: ReactNode;
} & Record<string, unknown>;

function PanelToggleBase<Key extends string>({
    value,
    onChange,
    panels,
    panelProps = {},
    label,
    className,
    children,
    ...rest
}: PanelToggleBaseProps<Key>): ReactElement {
    // Extract child values to determine available panels
    // We will always have one panel showing, and panels cannot be deselected
    const childValues = Children.toArray(children)
        .map((node: any) => node?.props?.value)
        .filter((val): val is Key => typeof val === 'string' && val.length > 0);

    const panelKeys: readonly Key[] = 
        childValues.length > 0 ? (childValues as Key[]) : (Object.keys(panels || {}) as Key[]);
    
    const firstKey: Key | null = panelKeys[0] ?? null;
    const isValid = (k: string): k is Key => (panelKeys as readonly string[]).includes(k);

    // Effective value to render with (never blank in the toggle)
    const effectiveValue: Key | '' = isValid(value as unknown as string)
        ? value
        : (firstKey ?? '') as Key | '';

    const ActiveComponent: ComponentType<any> | null = 
        (effectiveValue ? panels?.[effectiveValue as Key] : null) ?? null;

    const resolvedProps =
        typeof panelProps === 'function'
            ? (panelProps as (k: Key) => Record<string, unknown>)(effectiveValue as Key)
            : panelProps;

    // Handle change, respecting forceActive
    const handleChange = useCallback(
        (next: string) => {
            const ok = isValid(next);
            if (ok && next !== value) onChange(next as Key);
        },
        [onChange, value, isValid]
    );

    return (
        <Flex direction="column" gap={2} className={className} {...rest}>
            <CustomToggleGroup
                {...(label ? { label } : null)}
                value={effectiveValue as string}
                onChange={handleChange}
                >
                {children}
            </CustomToggleGroup>
            {ActiveComponent ? (
                <FlexBlock>
                    <Suspense fallback={null}>
                        <ActiveComponent {...resolvedProps} />
                    </Suspense>
                </FlexBlock>
            ) : null}
        </Flex>
    );
}

const PanelToggleInner = memo(PanelToggleBase) as <Key extends string>(
    props: PanelToggleBaseProps<Key>
) => ReactElement;

type PanelToggleComponent = typeof PanelToggleInner & {
    Text: typeof CustomToggleGroup.TextOption;
    Icon: typeof CustomToggleGroup.IconOption;
    Composite: typeof CustomToggleGroup.CompositeOption;

};

const PanelToggle = PanelToggleInner as PanelToggleComponent;
PanelToggle.Text = CustomToggleGroup.TextOption;
PanelToggle.Icon = CustomToggleGroup.IconOption;
PanelToggle.Composite = CustomToggleGroup.CompositeOption;
export default PanelToggle;