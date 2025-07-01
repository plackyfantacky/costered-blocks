import { BaseControl, Flex } from '@wordpress/components';
import UnitControlInput from "./UnitContolInput.jsx";

export default function PaddingControls({ attributes, setAttributes }) {
    const update = (key) => (value) => setAttributes({ [key]: value });
    return (
        <BaseControl label="Padding">
            <Flex gap="0" justify="space-between">
                <UnitControlInput value={attributes.paddingTop} onChange={update('paddingTop')} label="Top" />
                <UnitControlInput value={attributes.paddingBottom} onChange={update('paddingBottom')} label="Bottom" />
            </Flex>
            <Flex gap="0" justify="space-between">
                <UnitControlInput value={attributes.paddingLeft} onChange={update('paddingLeft')} label="Left" />
                <UnitControlInput value={attributes.paddingRight} onChange={update('paddingRight')} label="Right" />
            </Flex>
        </BaseControl>
    );
}
