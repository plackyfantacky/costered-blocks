import { BaseControl, Flex } from '@wordpress/components';
import SideInput from './SideInput.jsx';

export default function PaddingControls({ attributes, setAttributes }) {
    const update = (key) => (value) => setAttributes({ [key]: value });
    return (
        <BaseControl label="Padding">
            <Flex gap="0" justify="space-between">
                <SideInput value={attributes.paddingTop} onChange={update('paddingTop')} placeholder="Top" />
                <SideInput value={attributes.paddingRight} onChange={update('paddingRight')} placeholder="Right" />
                <SideInput value={attributes.paddingBottom} onChange={update('paddingBottom')} placeholder="Bottom" />
                <SideInput value={attributes.paddingLeft} onChange={update('paddingLeft')} placeholder="Left" />
            </Flex>
        </BaseControl>
    );
}
