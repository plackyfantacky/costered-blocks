import { BaseControl, Flex } from '@wordpress/components';
import SideInput from './SideInput.jsx';

export default function PaddingControls({ attributes, setAttributes }) {
    const update = (key) => (value) => setAttributes({ [key]: value });
    return (
        <BaseControl label="Padding">
            <Flex gap="0" justify="space-between">
                <SideInput value={attributes.paddingTop} onChange={update('paddingTop')} label="Top" placeholder="0" />
                <SideInput value={attributes.paddingRight} onChange={update('paddingRight')} label="Right" placeholder="0" />
                <SideInput value={attributes.paddingBottom} onChange={update('paddingBottom')} label="Bottom" placeholder="0" />
                <SideInput value={attributes.paddingLeft} onChange={update('paddingLeft')} label="Left" placeholder="0" />
            </Flex>
        </BaseControl>
    );
}
