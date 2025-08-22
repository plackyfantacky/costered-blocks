import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexBlock } from '@wordpress/components';

import { useSelectedBlockInfo, useSetOrUnsetAttrs } from "@hooks";

import { CustomSelectControl } from "@components/CustomSelectControl";
import CustomToggleGroup from "@components/CustomToggleGroup";

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

const GridTemplateColumnsControl = ({ attributes, clientId, updateAttributes }) => {

}
    

const GridControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;

    const { attributes } = selectedBlock;

    return (
        <Panel>
            <PanelBody title={__('Flexbox Controls', 'costered-blocks')} initialOpen={true}>
                <Flex direction="column" expanded={true}>
                    <FlexBlock>
                        {/* <FlexWrapButtonGroupControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                        /> */}
                        beans
                    </FlexBlock>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

const isGrid = (attributes = {}) => {
    const value = attributes?.display ?? attributes?.style?.display ?? '';
    return /^(grid|inline-grid)$/.test(value);
}

export default {
    name: 'grid-controls',
    title: __('Grid Controls', 'costered-blocks'),
    icon: <FlexNoWrapRounded />,
    isVisible: ({ attributes }) => isGrid(attributes),
    render: () => <GridControls />,
};