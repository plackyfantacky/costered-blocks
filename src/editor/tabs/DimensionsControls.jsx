import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody } from '@wordpress/components';

import { useSelectedBlockInfo } from "@hooks";
import { DimensionInputGroup } from "@components/composite/DimensionInputGroup";

import { DimensionsIcon } from "@components/Icons";

const DimensionControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;
    const { attributes } = selectedBlock;

    return (
        <Panel>
            <PanelBody title={__('Dimensions', 'costered-blocks')} initialOpen={true}>
                <DimensionInputGroup
                    attributes={attributes}
                    clientId={clientId}
                    updateAttributes={updateBlockAttributes}
                />
            </PanelBody>
            <PanelBody title={__('Minimum Dimensions', 'costered-blocks')} initialOpen={false}>
                <DimensionInputGroup
                    groupKey="min"
                    attributes={attributes}
                    clientId={clientId}
                    updateAttributes={updateBlockAttributes}
                />
            </PanelBody>
            <PanelBody title={__('Maximum Dimensions', 'costered-blocks')} initialOpen={false}>
                <DimensionInputGroup
                    groupKey="max"
                    attributes={attributes}
                    clientId={clientId}
                    updateAttributes={updateBlockAttributes}
                />
            </PanelBody>
        </Panel>
    );
};

export default {
    name: "dimensions-controls",
    title: __('Dimensions', 'costered-blocks'),
    icon: <DimensionsIcon />,
    render: () => <DimensionControls />,
};