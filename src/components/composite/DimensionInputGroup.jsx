import { __ } from '@wordpress/i18n';
import { Flex, FlexItem, PanelRow, ToggleControl } from '@wordpress/components';
import UnitControlInput from '@components/UnitControlInput';
import TextControlInput from '@components/TextControlInput';

export default function DimensionInputGroup({ keys, modeKey, attributes, clientId, updateAttributes }) {
    const mode = attributes?.[modeKey] || 'unit';

    const toggleMode = () => {
        const next = mode === 'unit' ? 'text' : 'unit';
        updateAttributes(clientId, {
            ...attributes,
            [modeKey]: next
        });
    };

    const handleChange = (key) => (value) => {
        updateAttributes(clientId, {
            ...attributes,
            [key]: value
        });
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
                                onChange={handleChange(key)}
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
                            checked={mode === 'unit'}
                            onChange={toggleMode}
                            __nextHasNoMarginBottom
                        />
                    </FlexItem>
                </Flex>
            </PanelRow>
        </>
    );
}