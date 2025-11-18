import { useCallback, memo } from '@wordpress/element';
import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon
} from '@wordpress/components';

type ToggleValue = string;

export interface CustomToggleGroupProps {
    value: ToggleValue;
    onChange: (value: ToggleValue) => void;
    label?: React.ReactNode | string;
    isBlock?: boolean;
    isDeselectable?: boolean;
    children: React.ReactNode;
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
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

function CustomToggleGroupBase({ value, onChange, label = "", isBlock = true, children, ...rest }: CustomToggleGroupProps) {
    const handleChange = useCallback((next: ToggleValue) => onChange(next), [onChange]);

    return (
            <ToggleGroupControl
                className={`costered-blocks--custom-toggle-group ${value ? 'has-selection' : 'is-empty'}`}
                label={label}
                value={value}
                onChange={handleChange}
                isBlock={isBlock}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
                isDeselectable
                {...rest}
            >
                {children}
            </ToggleGroupControl>
    );
}

function TextOption({ value, label, disabled }: TextOptionProps) {
    return (
        <ToggleGroupControlOption
            className={`costered-blocks--custom-toggle-group--text-option`}
            value={value}
            label={label}
            disabled={disabled}
        />
    );
}

function IconOption({ value, icon, label, showTooltip = true, disabled }: IconOptionProps) {
    return (
        <ToggleGroupControlOptionIcon
            className={`costered-blocks--custom-toggle-group--icon-option`}
            value={value}
            icon={icon}
            aria-label={label}
            label={label}
            showTooltip={showTooltip}
            disabled={disabled}
        />
    );
}

/**
 * convert <CompositeOption className={classname} value={value} disabled>{children}</CompositeOption> to <ToggleGroupControlOption className={classname} value={value} label={children} disabled={disabled} />
 */
function CompositeOption({ children, value, disabled, className = '' }: CompositeOptionProps) {
    return (
        <ToggleGroupControlOption
            className={`costered-blocks--custom-toggle-group--item ${className}`}
            value={value}
            label={children} // children can be string or ReactNode (apparently)
            disabled={disabled}
        />
    );
}

type CustomToggleGroupCompound =
    React.MemoExoticComponent<React.FC<CustomToggleGroupProps>> & {
        TextOption: React.FC<TextOptionProps>;
        IconOption: React.FC<IconOptionProps>;
        CompositeOption: React.FC<CompositeOptionProps>;
    };

const CustomToggleGroup = memo(CustomToggleGroupBase) as CustomToggleGroupCompound;
CustomToggleGroup.TextOption = TextOption;
CustomToggleGroup.IconOption = IconOption;
CustomToggleGroup.CompositeOption = CompositeOption;

export default CustomToggleGroup;