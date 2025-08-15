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
    FlexDirectionColumn,
    FlexDirectionColumnReverse,
    FlexDirectionRow,
    FlexDirectionRowReverse,
    FlexWrapNone,
    FlexWrapWrap,
    FlexWrapReverse,
    FlexJustifyStart,
    FlexJustifyEnd,
    FlexJustifyCenter,
    FlexJustifySpaceAround,
    FlexJustifySpaceBetween,
    FlexJustifySpaceEven,
    FlexAlignStart,
    FlexAlignEnd,
    FlexAlignCenter,
    FlexAlignSpaceAround,
    FlexAlignSpaceBetween,
    FlexAlignSpaceEven
} from "@components/Icons";

const DirectionSelectControl = ({ attributes, clientId, updateAttributes }) => {
    const directionOptions = [
        { value: 'row', content: __('Row', 'costered-blocks'), icon: <FlexDirectionRow />, altIcon: <FlexDirectionRowReverse /> },
        { value: 'row-reverse', content: __('Row Reverse', 'costered-blocks'), icon: <FlexDirectionRowReverse />, altIcon: <FlexDirectionRow /> },
        { value: 'column', content: __('Column', 'costered-blocks'), icon: <FlexDirectionColumn /> },
        { value: 'column-reverse', content: __('Column Reverse', 'costered-blocks'), icon: <FlexDirectionColumnReverse /> },
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
        { value: 'nowrap', content: __('No Wrap', 'costered-blocks'), icon: <FlexWrapNone /> },
        { value: 'wrap', content: __('Wrap', 'costered-blocks'), icon: <FlexWrapWrap /> },
        { value: 'wrap-reverse', content: __('Wrap Reverse', 'costered-blocks'), icon: <FlexWrapReverse /> },
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

const MainAxisAlignmentToggleGroupControl = ({ attributes, clientId, updateAttributes }) => {

    //row/row-reverse
    const alignOptions = [
        { value: 'flex-start', content: __('Start', 'costered-blocks'), icon: <FlexJustifyStart />, altIcon: <FlexJustifyEnd /> },
        { value: 'flex-end', content: __('End', 'costered-blocks'), icon: <FlexJustifyEnd />, altIcon: <FlexJustifyStart /> },
        { value: 'center', content: __('Center', 'costered-blocks'), icon: <FlexJustifyCenter /> },
        { value: 'space-around', content: __('Space Around', 'costered-blocks'), icon: <FlexJustifySpaceAround /> },
        { value: 'space-between', content: __('Space Between', 'costered-blocks'), icon: <FlexJustifySpaceBetween /> },
        { value: 'space-evenly', content: __('Space Evenly', 'costered-blocks'), icon: <FlexJustifySpaceEven /> },
    ];

    const altAlignOptions = [
        { value: 'flex-start', content: __('Start', 'costered-blocks'), icon: <FlexAlignEnd />, altIcon: <FlexAlignStart /> },
        { value: 'flex-end', content: __('End', 'costered-blocks'), icon: <FlexAlignStart />, altIcon: <FlexAlignEnd /> },
        { value: 'center', content: __('Center', 'costered-blocks'), icon: <FlexAlignCenter /> },
        { value: 'space-around', content: __('Space Around', 'costered-blocks'), icon: <FlexAlignSpaceAround /> },
        { value: 'space-between', content: __('Space Between', 'costered-blocks'), icon: <FlexAlignSpaceBetween /> },
        { value: 'space-evenly', content: __('Space Evenly', 'costered-blocks'), icon: <FlexAlignSpaceEven /> },
    ];

    return (
        <FlexPropertyButtonGroup
            type="icon"
            label={__('Main Axis Alignment', 'costered-blocks')}
            value={attributes?.justifyContent || 'flex-start'}
            onChange={setOrUnsetAttrs('justifyContent', attributes, updateAttributes, clientId)}
            options={attributes?.flexDirection?.includes('row') ? alignOptions : altAlignOptions}
        />
    )
};

const CrossAxisAlignmentToggleGroupControl = ({ attributes, clientId, updateAttributes }) => {

    //column/column-reverse
    const alignOptions = [
        { value: 'flex-start', content: __('Start', 'costered-blocks'), icon: <FlexJustifyEnd />, altIcon: <FlexJustifyStart /> },
        { value: 'flex-end', content: __('End', 'costered-blocks'), icon: <FlexJustifyStart />, altIcon: <FlexJustifyEnd /> },
        { value: 'center', content: __('Center', 'costered-blocks'), icon: <FlexJustifyCenter /> },
        { value: 'space-around', content: __('Space Around', 'costered-blocks'), icon: <FlexJustifySpaceAround /> },
        { value: 'space-between', content: __('Space Between', 'costered-blocks'), icon: <FlexJustifySpaceBetween /> },
        { value: 'space-evenly', content: __('Space Evenly', 'costered-blocks'), icon: <FlexJustifySpaceEven /> },
    ];

    const altAlignOptions = [
        { value: 'flex-start', content: __('Start', 'costered-blocks'), icon: <FlexAlignStart />, altIcon: <FlexAlignEnd /> },
        { value: 'flex-end', content: __('End', 'costered-blocks'), icon: <FlexAlignEnd />, altIcon: <FlexAlignStart /> },
        { value: 'center', content: __('Center', 'costered-blocks'), icon: <FlexAlignCenter /> },
        { value: 'space-around', content: __('Space Around', 'costered-blocks'), icon: <FlexAlignSpaceAround /> },
        { value: 'space-between', content: __('Space Between', 'costered-blocks'), icon: <FlexAlignSpaceBetween /> },
        { value: 'space-evenly', content: __('Space Evenly', 'costered-blocks'), icon: <FlexAlignSpaceEven /> },
    ];


    return (
        <FlexPropertyButtonGroup
            type="icon"
            label={__('Cross Axis Alignment', 'costered-blocks')}
            value={attributes?.alignItems || 'flex-start'}
            onChange={setOrUnsetAttrs('alignItems', attributes, updateAttributes, clientId)}
            options={attributes?.flexDirection?.includes('column') ? alignOptions : altAlignOptions}
        />
    );
};

const FlexBoxControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;

    const { attributes } = selectedBlock;

    return (
        <Panel>
            <PanelBody title={__('Flexbox Controls', 'costered-blocks')} initialOpen={true}>
                <Flex direction="column" className="flexbox-controls">
                    <FlexItem>
                        <DirectionSelectControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                        />
                    </FlexItem>
                    <FlexItem>
                        <FlexWrapButtonGroupControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                        />
                    </FlexItem>
                    <FlexItem>
                        <MainAxisAlignmentToggleGroupControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                        />
                    </FlexItem>
                    <FlexItem>
                        <CrossAxisAlignmentToggleGroupControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
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