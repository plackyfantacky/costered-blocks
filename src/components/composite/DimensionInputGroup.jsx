import { __ } from '@wordpress/i18n';
import { Flex, FlexItem, PanelRow, ToggleControl } from '@wordpress/components';
import UnitControlInput from '@components/UnitControlInput';
import TextControlInput from '@components/TextControlInput';

import { useSetOrUnsetAttrs } from "@lib/hooks";

export default function DimensionInputGroup({ keys, modeKey, attributes, clientId, updateAttributes }) {
    const mode = attributes?.[modeKey] || 'unit';

    const toggleMode = () => {
        const next = mode === 'unit' ? 'text' : 'unit';
        useSetOrUnsetAttrs(modeKey, attributes, updateAttributes, clientId)(next);
    };

    const InputField = mode === 'unit' ? UnitControlInput : TextControlInput;

    return (
        <>
            <PanelRow>
                <Flex gap="0" justify="space-between">
                    {keys.map((key) => (
                        <FlexItem key={key}>
                            <InputField
                                label={key.replace(/^./, c => c.toUpperCase())}
                                value={attributes[key] || ''}
                                onChange={ useSetOrUnsetAttrs(key, attributes, updateAttributes, clientId) }
                            />
                        </FlexItem>
                    ))}
                </Flex>
            </PanelRow>
            <PanelRow>
                <Flex style={{ marginTop: '0.5rem' }}>
                    <FlexItem>
                        <ToggleControl
                            label={__('Use custom values (e.g auto, calc)', 'costered-blocks')}
                            checked={mode === 'text'}
                            onChange={toggleMode}
                            __nextHasNoMarginBottom
                        />
                    </FlexItem>
                </Flex>
            </PanelRow>
        </>
    );
}