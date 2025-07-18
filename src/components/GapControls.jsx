import { BaseControl, Flex } from '@wordpress/components';
import UnitControlInput from "./UnitContolInput.jsx";

export default function GapControls({ attributes, setAttributes }) {
    const update = (key) => (value) => setAttributes({ [key]: value });
    return (
        <BaseControl label="Gap">
            <Flex gap="0" justify="space-between">
                <UnitControlInput value={attributes.gapHorizontal} onChange={update('gapHorizontal')} label="Horizontal" />
                <UnitControlInput value={attributes.gapVertical} onChange={update('gapVertical')} label="Vertical" />
            </Flex>
        </BaseControl>
    );
}
