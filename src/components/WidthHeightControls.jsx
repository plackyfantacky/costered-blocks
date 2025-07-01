import { BaseControl, Flex } from '@wordpress/components';
import UnitControlInput from "./UnitContolInput.jsx";

export default function WidthHeightControls({ attributes, setAttributes }) {
    const update = (key) => (value) => setAttributes({ [key]: value });

    return (
        <BaseControl label="Dimensions">
            <Flex gap="0" justify="space-between">
                <UnitControlInput value={attributes.buttonWidth} onChange={update('buttonWidth')} label="Width" />
                <UnitControlInput value={attributes.buttonHeight} onChange={update('buttonHeight')} label="Height" />
            </Flex>
        </BaseControl>
    );
}