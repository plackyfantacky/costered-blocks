import { BaseControl, Flex } from "@wordpress/components";
import SideInput from "./SideInput.jsx";

export default function MarginControls({ attributes, setAttributes }) {
    const update = (key) => (value) => setAttributes({ [key]: value });
    return (
        <BaseControl label="Margin">
            <Flex gap="0" justify="space-between">
                <SideInput value={attributes.marginTop} onChange={update('marginTop')} label="Top" placeholder="0" />
                <SideInput value={attributes.marginRight} onChange={update('marginRight')} label="Right" placeholder="0" />
                <SideInput value={attributes.marginBottom} onChange={update('marginBottom')} label="Bottom" placeholder="0" />
                <SideInput value={attributes.marginLeft} onChange={update('marginLeft')} label="Left" placeholder="0" />
            </Flex>
        </BaseControl>
    );
}
