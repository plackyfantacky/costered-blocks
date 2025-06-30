import { BaseControl, Flex } from '@wordpress/components';
import SideInput from "./SideInput.jsx";

export default function WidthHeightControls({ attributes, setAttributes }) {
    const update = (key) => (value) => setAttributes({ [key]: value });

    return (
        <BaseControl label="Dimensions">
            <Flex gap="0" justify="space-between">
                <SideInput value={attributes.buttonWidth} onChange={update('buttonWidth')} label="Width" placeholder="0" />
                <SideInput value={attributes.buttonHeight} onChange={update('buttonHeight')} label="Height" placeholder="0" />
            </Flex>
        </BaseControl>
    );
}