import { BaseControl, Flex } from '@wordpress/components';
import UnitControlInput from "./UnitContolInput.jsx";

export default function ButtonGapControls({ attributes, setAttributes }) {
    const update = (key) => (value) => setAttributes({ [key]: value });
    return (
        <BaseControl label="Gap">
            <Flex gap="0" justify="space-between">
                <UnitControlInput value={attributes.buttonGap} onChange={update('buttonGap')} label="Gap" />
            </Flex>
        </BaseControl>
    );
}
