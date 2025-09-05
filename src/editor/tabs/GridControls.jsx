import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexBlock } from '@wordpress/components';

import { useSelectedBlockInfo } from "@hooks";
import { GapControls } from '@components/composite/GapControls';
import { GridAxisControls } from '@components/composite/GridAxisControls';

import { MaterialSymbolsGridViewRounded as GridViewRounded } from "@assets/icons";

const GridControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { attributes, name } = selectedBlock;
    if (!selectedBlock) return null;

    return (
        <GridControlsInner
            clientId={clientId}
            attributes={attributes}
            name={name}
        />
    );
};

const GridControlsInner = ({ clientId, attributes, name }) => {
    const { updateBlockAttributes } = useDispatch('core/block-editor');
    return (
        <Panel>
            <PanelBody title={__('Grid Template', 'costered-blocks')} initialOpen={true}>
                <GridAxisControls />
            </PanelBody>
            <PanelBody title={__('Gap', 'costered-blocks')} initialOpen={true}>
                <Flex direction="column" expanded={true}>
                    <FlexBlock>
                        <GapControls
                            attributes={attributes}
                            clientId={clientId}
                            updateBlockAttributes={updateBlockAttributes}
                            blockName={name}
                        />
                    </FlexBlock>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

const isGrid = (attributes = {}) => {
    const value = attributes?.display ?? attributes?.style?.display ?? '';
    return /^(grid|inline-grid)$/.test(value);
};

export default {
    name: 'grid-controls',
    title: __('Grid Controls', 'costered-blocks'),
    icon: <GridViewRounded />,
    isVisible: ({ attributes }) => isGrid(attributes),
    render: () => <GridControls />,
};