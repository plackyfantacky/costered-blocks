import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useMemo } from '@wordpress/element';
import { Flex, FlexBlock, ToggleControl } from '@wordpress/components';

import { LABELS } from '@labels';
import UnitControlInput from "@components/UnitControlInput";
import TextControlInput from "@components/TextControlInput";

import { useAttrSetter, useUIPreferences, useScopedKey, useSafeBlockName } from "@hooks";

/**
 * Renders a pair of input controls for dimension attributes. Will always contain exactly one width and height input,
 * can be supplied a group key (e.g "min" or "max") and defaults to "" if not provided. Will also render a toggle 
 * control to switch between unit and text input modes.
 * 
 * @param {string} groupKey - The key for the group of attributes, defaults to "size".
 * @param {Object} attributes - The block attributes containing the values to edit.
 * @param {string} clientId - The client ID of the block being edited.
 * @param {Function} updateBlockAttributes - Function to update block attributes.
 * 
 * @returns {JSX.Element} A FlexBox containing the dimension input and toggle controls.
 */
export function DimensionInputGroup({ groupKey = "", attributes, clientId, updateBlockAttributes, blockName = null, labels = {} }) {
    const {set, withPrefix } = useAttrSetter(updateBlockAttributes, clientId);

    const modeKey = groupKey ? `${groupKey}DimensionMode` : 'dimensionMode';
    const safeBlockName = useSafeBlockName(blockName, clientId);

    // Use a scoped preference key for the dimension mode
    const prefKey = useScopedKey(modeKey, { blockName: safeBlockName });
    const [mode, setMode] = useUIPreferences(prefKey, 'unit');

    const ns = useMemo(
        () => (groupKey ? withPrefix(groupKey) : null),
        [withPrefix, groupKey]
    );

    // Generate the key for width and height based on the groupKey
    const keyFor = useCallback(
        (base) => {
            if (!groupKey) return base.toLowerCase(); // width, height
            const cap = base[0].toUpperCase() + base.slice(1); // Width, Height
            return `${groupKey}${cap}`; // minWidth, maxHeight
        },
        [groupKey]
    );

    // Prepare the values for width and height based on the groupKey
    // If groupKey is provided, it will use minWidth, minHeight etc.
    const values = useMemo(() => ({
        width: attributes?.[keyFor('width')] || '',
        height: attributes?.[keyFor('height')] || ''
    }), [attributes, groupKey]);

    const Input = mode === 'unit' ? UnitControlInput : TextControlInput;

    const widthLabel = labels.width || LABELS.dimensionInputGroup.width;
    const heightLabel = labels.height || LABELS.dimensionInputGroup.height;
    
    const setWidth = useCallback(
        (next) => ns? ns.set('Width', next) : set('width', next),
        [ns, set]
    );

    const setHeight = useCallback(
        (next) => ns ? ns.set('Height', next) : set('height', next),
        [ns, set]
    );

    return (
        <Flex direction={'column'} gap={4} style={{ marginBottom: '1rem' }}>
            <FlexBlock>
                <Flex gap={2} wrap={false} align="stretch" justify="space-between">
                    <Input
                        value={values.width}
                        onChange={setWidth}
                        label={widthLabel}
                    />
                    <Input
                        value={values.height}
                        onChange={setHeight}
                        label={heightLabel}
                    />
                </Flex>
            </FlexBlock>
            <FlexBlock>
                <ToggleControl
                    label={LABELS.dimensionInputGroup.useCustom}
                    checked={mode === 'text'}
                    onChange={(isUnit) => setMode(isUnit ? 'text' : 'unit')}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />
            </FlexBlock>
        </Flex>
    );
}