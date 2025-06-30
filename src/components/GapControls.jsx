import { BaseControl, Flex } from '@wordpress/components';
import SideInput from './SideInput.jsx';

export default function GapControls({ attributes, setAttributes }) {
    const update = (key) => (value) => setAttributes({ [key]: value });
    return (
        <BaseControl label="Gap">
            <Flex gap="0" justify="space-between">
                <SideInput value={attributes.gapHorizontal} onChange={update('gapHorizontal')} label="Horizontal" placeholder="0" />
                <SideInput value={attributes.gapVertical} onChange={update('gapVertical')} label="Vertical" placeholder="0" />
            </Flex>
        </BaseControl>
    );
}
