import { useRef, useCallback, useMemo, memo } from '@wordpress/element';
import { Flex, FlexItem,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon
} from '@wordpress/components';

type ToggleValue = string;

export interface CustomToggleGridProps {
    value: ToggleValue;
    onChange: (value: ToggleValue) => void;
    label?: React.ReactNode | string;
    isBlock?: boolean;
    children: React.ReactNode;
    
    columns?: number;
    minItemWidth?: string | number;
    gap?: string | number;
    gridTemplateColumns?: React.CSSProperties;
    
    isDeselectable?: boolean;
    [extraProps: string]: unknown;
}

export interface TextOptionProps {
    value: ToggleValue;
    label: string;
    disabled?: boolean;
}

export interface IconOptionProps {
    value: ToggleValue;
    icon: React.ReactNode;
    label: string;
    showTooltip?: boolean;
    disabled?: boolean;
}

export interface CompositeOptionProps {
    value: ToggleValue;
    label?: string;
    disabled?: boolean;
    children: React.ReactNode;
}

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
}: CustomToggleGridProps) {
    const rootRef = useRef<HTMLDivElement | null>(null); // the element that owns ::before (top-level)
    const controlRef = useRef<any>(null);
    const gridRef = useRef<HTMLDivElement | null>(null); // the grid layout element

    const handleChange = useCallback((next: ToggleValue) => onChange(next), [onChange]);

    const computedTemplate = useMemo<React.CSSProperties>(() => {
        if(gridTemplateColumns) return gridTemplateColumns;
        const width = typeof minItemWidth === 'number' ? `${minItemWidth}px` : String(minItemWidth);
        return { '--cb-grid-template-columns': `repeat(${columns}, minmax(${width}, 1fr))` } as React.CSSProperties;
    },
    [gridTemplateColumns, columns, minItemWidth]);

    const computedGap = useMemo<React.CSSProperties>(() => {
        return (typeof gap === 'number'
            ? { '--cb-grid-gap': `${gap * 0.25}rem` }
            : { '--cb-grid-gap': String(gap) }) as React.CSSProperties;
    }, [gap]);

    const rootClass = `costered-blocks--custom-toggle-grid ${value ? 'has-selection' : 'is-empty'}`

    return (
        <div ref={rootRef} className={rootClass}>
            <ToggleGroupControl
                className="costered-blocks--custom-toggle-grid--control"
                ref={controlRef}
                label={label}
                value={value}
                onChange={handleChange}
                isBlock={isBlock}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
                isDeselectable
                {...rest}
            >
                <div 
                    className="costered-blocks--custom-toggle-grid--grid"
                    ref={gridRef}
                    style={{ ...computedTemplate, ...computedGap }}
                >
                    {children}
                </div>
            </ToggleGroupControl>
        </div>
    );
}

function TextOption({ value, label, disabled }: TextOptionProps) {
    return (
        <ToggleGroupControlOption
            className={`costered-blocks--custom-toggle-grid--tile costered-blocks--custom-toggle-grid--text-option`}
            value={value}
            label={label}
            disabled={disabled}
        />
    );
}

function IconOption({ value, icon, label, showTooltip = true, disabled }: IconOptionProps) {
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

function CompositeOption({ value, children, label, disabled }: CompositeOptionProps) {
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

type CustomToggleGridCompound = 
    React.MemoExoticComponent<React.FC<CustomToggleGridProps>> & {
        TextOption: React.FC<TextOptionProps>;
        IconOption: React.FC<IconOptionProps>;
        CompositeOption: React.FC<CompositeOptionProps>;
    };

const CustomToggleGrid = memo(CustomToggleGridBase) as CustomToggleGridCompound;
CustomToggleGrid.TextOption = TextOption;
CustomToggleGrid.IconOption = IconOption;
CustomToggleGrid.CompositeOption = CompositeOption;
export default CustomToggleGrid;