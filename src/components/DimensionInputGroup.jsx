import { BaseControl, Flex, FlexItem, ToggleControl } from '@wordpress/components';
import UnitControlInput from '@components/UnitControlInput';
import TextControlInput from '@components/TextControlInput';

export default function DimensionInputGroup({ label, keys, modeKey, attributes, clientId, updateAttributes }) {
    const mode = attributes?.[modeKey] || 'unit';

    const toggleMode = () => {
        const next = mode === 'unit' ? 'text' : 'unit';
        updateAttributes.updateBlockAttributes(clientId, {
            ...attributes,
            [modeKey]: next
        });
    };

    const handleChange = (key) => (value) => {
        updateAttributes.updateBlockAttributes(clientId, {
            ...attributes,
            [key]: value
        });
    }

    const InputField = mode === 'unit' ? UnitControlInput : TextControlInput;

    return (
        <>
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
            <Flex style={{ marginTop: '0.5rem' }}>
                <FlexItem>
                    <ToggleControl
                        label="Use custom values (e.g auto, calc)"
                        checked={mode === 'unit'}
                        onChange={toggleMode}
                        __nextHasNoMarginBottom
                    />
                </FlexItem>
            </Flex>
        </>
    );
}