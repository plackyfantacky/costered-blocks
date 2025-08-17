import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody } from '@wordpress/components';

import { useSelectedBlockInfo } from "@lib/hooks";
import DimensionInputGroup from "@components/composite/DimensionInputGroup";

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
                    keys={['width', 'height']}
                    modeKey="dimensionMode"
                    attributes={attributes}
                    clientId={clientId}
                    updateAttributes={updateBlockAttributes}
                />
            </PanelBody>
            <PanelBody title={__('Minimum Dimensions', 'costered-blocks')} initialOpen={false}>
                <DimensionInputGroup
                    keys={['minWidth', 'minHeight']}
                    modeKey="minDimensionMode"
                    attributes={attributes}
                    clientId={clientId}
                    updateAttributes={updateBlockAttributes}
                />
            </PanelBody>
            <PanelBody title={__('Maximum Dimensions', 'costered-blocks')} initialOpen={false}>
                <DimensionInputGroup
                    keys={['maxWidth', 'maxHeight']}
                    modeKey="maxDimensionMode"
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