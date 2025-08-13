import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import {
    Panel, PanelBody, Flex, FlexItem,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption
} from '@wordpress/components';

import { useSelectedBlockInfo, useUnsetBlockAttributes } from "@lib/hooks";

import CustomSelectControl from "@components/CustomSelectControl";
import FlexPropertyButtonGroup from "@components/composite/FlexPropertyButtonGroup";
import { setOrUnsetAttrs } from "@lib/utils";
import {
    FlexNoWrapRounded,
    ArrowUpThin,
    ArrowDownThin,
    ArrowLeftThin,
    ArrowRightThin,
    CustomFlexNoWrap,
    CustomFlexWrap,
    CustomFlexWrapReverse
} from "@components/Icons";

const DirectionSelectControl = ({ attributes, clientId, updateAttributes }) => {
    const directionOptions = [
        { value: 'row', content: __('Row', 'costered-blocks'), icon: <ArrowRightThin />, altIcon: <ArrowLeftThin /> },
        { value: 'row-reverse', content: __('Row Reverse', 'costered-blocks'), icon: <ArrowLeftThin />, altIcon: <ArrowRightThin /> },
        { value: 'column', content: __('Column', 'costered-blocks'), icon: <ArrowDownThin /> },
        { value: 'column-reverse', content: __('Column Reverse', 'costered-blocks'), icon: <ArrowUpThin /> },
    ];

    return (
        <CustomSelectControl
            label={__('Flex Direction', 'costered-blocks')}
            value={typeof attributes?.flexDirection === "string" ? attributes.flexDirection : ""}
            onChange={setOrUnsetAttrs('flexDirection', attributes, updateAttributes, clientId)}
            options={directionOptions}
        />
    );
};

const FlexWrapButtonGroupControl = ({ attributes, clientId, updateAttributes }) => {
    const wrapOptions = [
        { value: 'nowrap', content: __('No Wrap', 'costered-blocks'), icon: <CustomFlexNoWrap /> },
        { value: 'wrap', content: __('Wrap', 'costered-blocks'), icon: <CustomFlexWrap /> },
        { value: 'wrap-reverse', content: __('Wrap Reverse', 'costered-blocks'), icon: <CustomFlexWrapReverse /> },
    ];

    return (
        <FlexPropertyButtonGroup
            type="both"
            label={__('Flex Wrap', 'costered-blocks')}
            value={attributes?.flexWrap || 'nowrap'}
            onChange={setOrUnsetAttrs('flexWrap', attributes, updateAttributes, clientId)}
            options={wrapOptions}
        />
    );
};

// const MainAxisAlignmentSelectControl = ({ attributes, clientId, updateAttributes }) => {
//     const handleChange = (value) => {
//         if (!value) {
//             updateAttributes(clientId, {
//                 ...attributes,
//                 justifyContent: undefined
//             });
//         } else {
//             updateAttributes(clientId, {
//                 ...attributes,
//                 justifyContent: value
//             });
//         }
//     }

//     const justifyOptions = [
//         { value: 'flex-start', content: __('Start', 'costered-blocks'), icon: <ArrowLeftThin />, altIcon: <ArrowRightThin /> },
//         { value: 'flex-end', content: __('End', 'costered-blocks'), icon: <ArrowRightThin />, altIcon: <ArrowLeftThin /> },
//         { value: 'center', content: __('Center', 'costered-blocks'), icon: <CustomFlexNoWrap /> },
//         { value: 'space-between', content: __('Space Between', 'costered-blocks'), icon: <CustomFlexWrap /> },
//         { value: 'space-around', content: __('Space Around', 'costered-blocks'), icon: <CustomFlexWrapReverse /> },
//     ];




    
        
// }


const FlexBoxControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;

    const { attributes } = selectedBlock;
    const unsetAttrs = useUnsetBlockAttributes(clientId);

    return (
        <Panel>
            <PanelBody title={__('Flexbox Controls', 'costered-blocks')} initialOpen={true}>
                <Flex direction="column" className="flexbox-controls">
                    <FlexItem>
                        <DirectionSelectControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                            //unsetAttrs={() => unsetAttrs(['flexDirection'])}
                        />
                    </FlexItem>
                    <FlexItem>
                        <FlexWrapButtonGroupControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                            //unsetAttrs={() => unsetAttrs(['flexWrap'])}
                        />
                    </FlexItem>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

const isFlex = (attributes = {}) => {
    const value = attributes?.display ?? attributes?.style?.display ?? '';
    return /^(flex|inline-flex)$/.test(value);
};

export default {
    name: 'flexbox-controls',
    title: __('Flexbox Controls', 'costered-blocks'),
    icon: <FlexNoWrapRounded />,
    isVisible: ({ attributes }) => isFlex(attributes),
    render: () => <FlexBoxControls />,
};