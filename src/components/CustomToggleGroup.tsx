import { useCallback, memo } from '@wordpress/element';
import { Flex, FlexItem,
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

export interface CombinedOptionProps {
    value: ToggleValue;
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
}

export interface CompositeOptionProps {
    value: ToggleValue;
    children: React.ReactNode;
    label: string;
    disabled?: boolean;
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

function CombinedOption({ value, icon, label, disabled }: CombinedOptionProps) {
    return (
        <ToggleGroupControlOption
            className={`costered-blocks--custom-toggle-group--combined-option`}
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

function CompositeOption({ value, children, label, disabled }: CompositeOptionProps) {
    return (
        <ToggleGroupControlOption
            className={`costered-blocks--custom-toggle-group--composite-option`}
            value={value}
            aria-label={label}
            label={children} // label accepts React nodes.
            disabled={disabled}
        />
    );
}

type CustomToggleGroupCompound =
    React.MemoExoticComponent<React.FC<CustomToggleGroupProps>> & {
        TextOption: React.FC<TextOptionProps>;
        IconOption: React.FC<IconOptionProps>;
        CombinedOption: React.FC<CombinedOptionProps>;
        CompositeOption: React.FC<CompositeOptionProps>;
    };

const CustomToggleGroup = memo(CustomToggleGroupBase) as CustomToggleGroupCompound;
CustomToggleGroup.TextOption = TextOption;
CustomToggleGroup.IconOption = IconOption;
CustomToggleGroup.CombinedOption = CombinedOption;
CustomToggleGroup.CompositeOption = CompositeOption;

export default CustomToggleGroup;