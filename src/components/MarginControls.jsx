import { BaseControl, Flex  } from "@wordpress/components";
import SideInput from "./SideInput.jsx";

export default function MarginControls({ attributes, setAttributes }) {
    const update = (key) => (value) => setAttributes({ [key]: value });
        return (
            <BaseControl label="Margin">
                <Flex gap="0" justify="space-between">
                    <SideInput value={attributes.marginTop} onChange={update('marginTop')} placeholder="Top" />
                    <SideInput value={attributes.marginRight} onChange={update('marginRight')} placeholder="Right" />
                    <SideInput value={attributes.marginBottom} onChange={update('marginBottom')} placeholder="Bottom" />
                    <SideInput value={attributes.marginLeft} onChange={update('marginLeft')} placeholder="Left" />
                </Flex>
            </BaseControl>
        );
}
