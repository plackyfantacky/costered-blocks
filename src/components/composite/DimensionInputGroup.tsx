import { Flex, FlexBlock, ToggleControl } from '@wordpress/components';

import { LABELS } from '@labels';
import CSSMeasurementControl from '@components/CSSMeasurementControl';

import { useUIPreferences, useScopedKey, useSafeBlockName } from "@hooks";

import type { MeasurementMode } from '@types';

type DimensionInputGroupProps = {
    groupKey?: '' | 'min' | 'max' | string;
    clientId: string;
    blockName?: string;
    labels?: {
        width?: string;
        height?: string;
    };
};

/**
 * Renders a pair of input controls for dimension attributes. Will always contain exactly one width and height input,
 * can be supplied a group key (e.g "min" or "max") and defaults to "" if not provided. Will also render a toggle 
 * control to switch between unit and text input modes.
 */
export function DimensionInputGroup({
    groupKey = "",
    clientId,
    blockName,
    labels = {}
}: DimensionInputGroupProps) {
    // Use a scoped preference key for the dimension mode
    const modeKey: string = groupKey ? `${groupKey}DimensionMode` : 'dimensionMode';
    const safeBlockName = useSafeBlockName(blockName, clientId);
    const prefKey = useScopedKey(modeKey, safeBlockName ? { blockName: safeBlockName } : undefined);
    const [mode, setMode] = useUIPreferences<MeasurementMode>(prefKey, 'unit');

    // Generate the key for width and height based on the groupKey
    const keyFor = (base: 'width' | 'height') => groupKey ? `${groupKey}${base.charAt(0).toUpperCase()}${base.slice(1)}` : base;

    const widthLabel = labels.width || LABELS.dimensionInputGroup.width;
    const heightLabel = labels.height || LABELS.dimensionInputGroup.height;

    return (
        <Flex direction={'column'} gap={4} className={"costered-blocks--dimension-input-group"}>
            <FlexBlock>
                <Flex gap={2} wrap={false} align="stretch" justify="space-between">
                    <CSSMeasurementControl
                        mode={mode}
                        clientId={clientId}
                        prop={keyFor("width")}
                        label={widthLabel}
                        allowReset
                    />
                    <CSSMeasurementControl
                        mode={mode}
                        clientId={clientId}
                        prop={keyFor("height")}
                        label={heightLabel}
                        allowReset
                    />
                </Flex>
            </FlexBlock>
            <FlexBlock>
                <ToggleControl
                    label={LABELS.dimensionInputGroup.useCustom}
                    checked={mode === 'text'}
                    onChange={(checked: boolean) => setMode(checked ? 'text' : 'unit')}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />
            </FlexBlock>
        </Flex>
    );
}