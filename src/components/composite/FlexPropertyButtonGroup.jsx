import { __, isRTL } from '@wordpress/i18n';
import { Flex, FlexItem, PanelRow, ToggleControl, TextControl } from '@wordpress/components';
import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon
} from '@wordpress/components';

import { DefaultIcon } from '@components/Icons';

export default function FlexPropertyButtonGroup({ value, onChange, options, label = "", type = "text" }) {
    
    const buttonOptions = options.map((opt) => {
        if (type === "text") {
            return (
                <ToggleGroupControlOption
                    key={opt.value}
                    value={opt.value}
                    label={opt.content}
                />
            );
        } else if (type === "icon") {
            return (
                <ToggleGroupControlOptionIcon
                    key={opt.value}
                    value={opt.value}
                    icon={isRTL() ? opt.altIcon : opt.icon || DefaultIcon}
                    aria-label="{opt.content}"
                    label={opt.content}
                    showTooltip
                />
            );
        } else {
            const labelAndIcon = (
                <Flex direction="column" gap={2} align="center">
                    <FlexItem>{isRTL() ? opt.altIcon : opt.icon || DefaultIcon}</FlexItem>
                    <FlexItem>{opt.content}</FlexItem>
                </Flex>
            )
            return (
                <ToggleGroupControlOption
                    key={opt.value}
                    value={opt.value}
                    label={labelAndIcon}
                />
            );
        }
    }) || [];

    return (
        <>
            <PanelRow>
                <Flex gap="0" justify="space-between">
                    <ToggleGroupControl
                        label={label}
                        onChange={onChange}
                        value={value}
                        isBlock
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                    >
                        {buttonOptions}
                    </ToggleGroupControl>
                </Flex>
            </PanelRow>
        </>
    );
}