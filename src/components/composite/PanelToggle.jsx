import { memo, useCallback, useEffect, Suspense, Children } from '@wordpress/element';
import { Flex, FlexBlock } from '@wordpress/components';

import { LABELS } from '@labels';
import CustomToggleGroup from '@components/CustomToggleGroup';

function PanelToggleBase({
    value,
    onChange,
    panels,
    panelProps = {},
    label = LABELS.panelToggle.label,
    forceActive = false,
    className,
    children,
    ...rest
}) {

    // Extract child values to determine available panels
    // We will always have one panel showing, and panels cannot be deselected
    const childValues = Children.toArray(children)
        .map((node) => node?.props?.value)
        .filter((v) => typeof v === 'string' && v.length > 0);

    const panelKeys = childValues.length > 0 ? childValues : Object.keys(panels || {});
    const firstKey = panelKeys[0] ?? null;

    useEffect(() => {
        if (!panelKeys.length) return; // nothing to select
        if (!value || !panelKeys.includes(value)) {
            onChange?.(firstKey);
        }
    }, [value, firstKey, panelKeys.join('|')]);

    // Handle change, respecting forceActive
    const handleChange = useCallback(
        (next) => {
            const nextValue = next ?? null;
            if (forceActive && nextValue === null) return;
            onChange?.(nextValue);
        }, [onChange, forceActive]
    );

    const ActiveComponent = value ? panels?.[value] : null;
    const resolvedProps =
        typeof panelProps === 'function' ? (value ? panelProps(value) : {}) : panelProps;

    return (
        <Flex direction="column" gap={2} className={className} {...rest}>
            <CustomToggleGroup
                label={label}
                value={value || undefined}
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

const PanelToggle = memo(PanelToggleBase);

PanelToggle.TextOption = CustomToggleGroup.TextOption;
PanelToggle.IconOption = CustomToggleGroup.IconOption;
PanelToggle.CombinedOption = CustomToggleGroup.CombinedOption;

export default PanelToggle;