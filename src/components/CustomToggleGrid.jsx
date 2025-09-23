import { useRef, useLayoutEffect, useCallback, memo } from '@wordpress/element';
import { Flex, FlexItem,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon
} from '@wordpress/components';

function CustomToggleGridBase({
    value,
    onChange,
    label = "",
    isBlock = true,
    children,
    columns = 3,
    minItemWidth = 0,
    gap = 6 /* default 1rem */,
    gridTemplateColumns,
    isDeselectable = true,
    ...rest
}) {

    const rootRef = useRef(null); // the element that owns ::before (top-level)
    const gridRef = useRef(null); // the grid layout element

    const handleChange = useCallback((next) => onChange(next), [onChange]);

    const computedTemplate = gridTemplateColumns ?? { '--cb-grid-template-columns': `repeat(${columns}, minmax(${minItemWidth}, 1fr))` };
    const computedGap = typeof gap === 'number' ? { '--cb-grid-gap': `${gap * 0.25}rem` } : { '--cb-grid-gap': gap };

    return (
        <div
            ref={rootRef}
            className={`costered-blocks--custom-toggle-grid ${value ? 'has-selection' : 'is-empty'}`}
        >
            <ToggleGroupControl
                className="costered-blocks--custom-toggle-grid--control"
                ref={rootRef}
                label={label}
                value={value}
                onChange={handleChange}
                isBlock={isBlock}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
                isDeselectable
                {...rest}
            >
                <div className="costered-blocks--custom-toggle-grid--grid" ref={gridRef} style={{ ...computedTemplate, ...computedGap }}>
                    {children}
                </div>
            </ToggleGroupControl>
        </div>
    );
}

function TextOption({ value, label, disabled }) {
    return (
        <ToggleGroupControlOption
            className={`costered-blocks--custom-toggle-grid--tile costered-blocks--custom-toggle-grid--text-option`}
            value={value}
            label={label}
            disabled={disabled}
        />
    );
}

function IconOption({ value, icon, label, showTooltip = true, disabled }) {
    return (
        <ToggleGroupControlOptionIcon
            className={`costered-blocks--custom-toggle-grid--tile costered-blocks--custom-toggle-grid--icon-option`}
            value={value}
            icon={icon}
            aria-label={label}
            label={label}
            showTooltip={showTooltip}
            disabled={disabled}
        />
    );
}

function CombinedOption({ value, icon, label, disabled }) {
    return (
        <ToggleGroupControlOption
            className={`costered-blocks--custom-toggle-grid--tile costered-blocks--custom-toggle-grid--combined-option`}
            value={value}
            aria-label={label}
            label={
                <Flex direction="column" gap={0} align="center" style={{ paddingBlock: '0.5em' }}>
                    <FlexItem>{icon}</FlexItem>
                    <FlexItem>{label}</FlexItem>
                </Flex>
            }
            disabled={disabled}
        />
    );
}

function CompositeOption({ value, children, label, disabled }) {
    return (
        <ToggleGroupControlOption
            className={`costered-blocks--custom-toggle-grid--tile costered-blocks--custom-toggle-grid--composite-option`}
            value={value}
            aria-label={label}
            label={children} // label accepts React nodes.
            disabled={disabled}
        />
    );
}

const CustomToggleGrid = memo(CustomToggleGridBase);
CustomToggleGrid.TextOption = TextOption;
CustomToggleGrid.IconOption = IconOption;
CustomToggleGrid.CombinedOption = CombinedOption;
CustomToggleGrid.CompositeOption = CompositeOption;
export default CustomToggleGrid;