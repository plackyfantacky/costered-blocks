import {
    BaseControl,
    Flex,
    ToggleControl
} from "@wordpress/components";
import UnitControlInput from "./UnitContolInput.jsx";
import TextControlInput from "./TextControlInput.jsx";

export default function MarginControls({ attributes, setAttributes }) {
    const { marginMode = 'default' } = attributes;
    const update = (key) => (value) => setAttributes({ [key]: value });
    
    return (

        <BaseControl label="Margin">
            {marginMode === 'default' ? (
                <>
                    <Flex gap="0" justify="space-between">
                        <UnitControlInput value={attributes.marginTop} onChange={update('marginTop')} label="Top" />
                        <UnitControlInput value={attributes.marginBottom} onChange={update('marginBottom')} label="Bottom" />
                    </Flex>
                    <Flex gap="0" justify="space-between">
                        <UnitControlInput value={attributes.marginLeft} onChange={update('marginLeft')} label="Left" />
                        <UnitControlInput value={attributes.marginRight} onChange={update('marginRight')} label="Right" />
                    </Flex>
                </>
            ) : (
                <>
                    <Flex gap="1" justify="space-between">
                        <TextControlInput value={attributes.marginTop} onChange={update('marginTop')} label="Top" placeholder="0" />
                        <TextControlInput value={attributes.marginBottom} onChange={update('marginBottom')} label="Bottom" placeholder="0" />
                    </Flex>
                    <Flex gap="1" justify="space-between">
                        <TextControlInput value={attributes.marginLeft} onChange={update('marginLeft')} label="Left" placeholder="0" />
                        <TextControlInput value={attributes.marginRight} onChange={update('marginRight')} label="Right" placeholder="0" />
                    </Flex>
                </>
            )}
            <ToggleControl
                label="Use custom values (e.g auto, calc)"
                checked={marginMode === 'custom'}
                onChange={(value) => setAttributes({ marginMode: value ? 'custom' : 'default' })}
                __nextHasNoMarginBottom
            />
        </BaseControl>
    );
}
