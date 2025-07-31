import {
    BaseControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    ToggleControl,
    __experimentalUnitControl as UnitControl

} from '@wordpress/components';
import { TextControl } from '@wordpress/components';

export default function ContainerSizingControls({ attributes, setAttributes }) {
    const updateContainerType = (value) => setAttributes({ containerType: value });
    const updateContainerMXAuto = (value) => setAttributes({ containerMXAuto: value });
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
                <ToggleGroupControlOption value="none" label="None" />
                <ToggleGroupControlOption value="full" label="Full Width" />
                <ToggleGroupControlOption value="boxed" label="Boxed" />
                <ToggleGroupControlOption value="flex" label="Flex Item" />
            </ToggleGroupControl>
            {attributes.containerType === 'boxed' && (
                <>
                    <ToggleControl
                        label="Add 'margin:auto' to container"
                        checked={attributes.containerMXAuto}
                        onChange={updateContainerMXAuto}
                        help="When enabled, the container will have 'margin: auto' applied, centering it within its parent."
                        
                    />
                    <UnitControl
                        label="Container Width"
                        value={attributes.containerWidth}
                        onChange={updateContainerWidth}
                        placeholder="0"
                        help="Set a custom width for the container when using 'Boxed' layout."
                    />
                </>
            )}
        </BaseControl>
    );
}
