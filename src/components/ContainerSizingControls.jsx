import {
    BaseControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption
} from '@wordpress/components';
import { TextControl } from '@wordpress/components';

export default function ContainerSizingControls({ attributes, setAttributes }) {
    const updateContainerType = (value) => setAttributes({ containerType: value });
    const updateContainerWidth = (value) => setAttributes({ containerWidth: value });
    return (
        <BaseControl label="Container Type">
            <ToggleGroupControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                isBlock
                value={attributes.containerType}
                onChange={updateContainerType}
            >
                <ToggleGroupControlOption value="full" label="Full Width" />
                <ToggleGroupControlOption value="boxed" label="Boxed" />
            </ToggleGroupControl>
            {attributes.containerType === 'boxed' && (
                <TextControl
                    label="Container Width"
                    value={attributes.containerWidth}
                    onChange={updateContainerWidth}
                    placeholder="e.g. 1200px, 80%"
                    help="Set a custom width for the container when using 'Boxed' layout."
                />
            )}
        </BaseControl>
    );
}
