import { __ } from '@wordpress/i18n';
import { useCallback, memo } from '@wordpress/element';
import { Flex, FlexItem,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon
} from '@wordpress/components';

function CustomToggleGroupBase({ value, onChange, label = "", isBlock = true, children }) {
    const handleChange = useCallback((next) => onChange(next), [onChange]);

    return (
            <ToggleGroupControl
                className={`costered-custom-toggle-group ${value ? 'has-selection' : 'is-empty'}`}
                label={label}
                value={value}
                onChange={handleChange}
                isBlock={isBlock}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
                isDeselectable
            >
                {children}
            </ToggleGroupControl>
    );
}

function TextOption({ value, label, disabled }) {
    return (
        <ToggleGroupControlOption
            value={value}
            label={label}
            disabled={disabled}
        />
    );
}

function IconOption({ value, icon, label, showTooltip = true, disabled }) {
    return (
        <ToggleGroupControlOptionIcon
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

const CustomToggleGroup = memo(CustomToggleGroupBase);
CustomToggleGroup.TextOption = TextOption;
CustomToggleGroup.IconOption = IconOption;
CustomToggleGroup.CombinedOption = CombinedOption;

export default CustomToggleGroup;