import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from '@wordpress/element';
import { Flex, FlexBlock, ToggleControl } from '@wordpress/components';

import UnitControlInput from "@components/UnitControlInput";
import TextControlInput from "@components/TextControlInput";

import { useAttrSetter } from "@hooks";

const startCase = (s) => s ? s.replace(/(^.|[-_]\w)/g, (m) => m.replace(/[-_]/, ' ').toUpperCase()) : '';

/**
 * Renders a pair of input controls for dimension attributes. Will always contain exactly one width and height input,
 * can be supplied a group key (e.g "min" or "max") and defaults to "" if not provided. Will also render a toggle 
 * control to switch between unit and text input modes.
 * 
 * @param {string} groupKey - The key for the group of attributes, defaults to "size".
 * @param {Object} attributes - The block attributes containing the values to edit.
 * @param {string} clientId - The client ID of the block being edited.
 * @param {Function} updateAttributes - Function to update block attributes.
 * 
 * @returns {JSX.Element} A FlexBox containing the dimension input and toggle controls.
 */
export function DimensionInputGroup({ groupKey = "", attributes, clientId, updateAttributes }) {
    const {set, withPrefix } = useAttrSetter(updateAttributes, clientId);

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

    const modeKey = groupKey ? `${groupKey}DimensionMode` : 'dimensionMode';
    const mode = attributes?.[modeKey] || 'unit';
    
    const Input = mode === 'unit' ? UnitControlInput : TextControlInput;

    const labelText = 
        groupKey !== '' 
        ? `${startCase(groupKey)} ${__('Dimensions', 'costered-blocks')}`
        : __('Dimensions', 'costered-blocks');

    const setWidth = useCallback(
        (next) => ns? ns.set('Width', next) : set('width', next),
        [ns, set]
    );

    const setHeight = useCallback(
        (next) => ns ? ns.set('Height', next) : set('height', next),
        [ns, set]
    );

    const onToggleMode = useCallback(() => {
        set(modeKey, mode === 'unit' ? 'text' : 'unit');
    }, [set, modeKey, mode]);

    return (
        <Flex direction={'column'} gap={4} style={{ marginBottom: '1rem' }}>
            <FlexBlock>
                <label style={{ marginBottom: '0.5rem' }}>{labelText}</label>
                <Flex gap={2} wrap={false} align="stretch" justify="space-between">
                    <Input
                        value={values.width}
                        onChange={setWidth}
                        label={__('Width', 'costered-blocks')}
                    />
                    <Input
                        value={values.height}
                        onChange={setHeight}
                        label={__('Height', 'costered-blocks')}
                    />
                </Flex>
            </FlexBlock>
            <FlexBlock>
                <ToggleControl
                    label={__('Use custom values (e.g auto, calc)', 'costered-blocks')}
                    checked={mode === 'text'}
                    onChange={onToggleMode}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />
            </FlexBlock>
        </Flex>
    );

}