import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody } from '@wordpress/components';

import { LABELS } from "@labels";
import { useSelectedBlockInfo } from "@hooks";
import { DimensionInputGroup } from "@components/composite/DimensionInputGroup";

import { RadixIconsDimensions as DimensionsIcon } from "@assets/icons";

const DimensionControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;
    const { attributes, name } = selectedBlock;

    return (
        <Panel>
            <PanelBody title={LABELS.dimensionControls.panelTitle} initialOpen={true}>
                <DimensionInputGroup
                    attributes={attributes}
                    clientId={clientId}
                    updateBlockAttributes={updateBlockAttributes}
                    blockName={name}
                />
            </PanelBody>
            <PanelBody title={LABELS.dimensionControls.minPanel} initialOpen={false}>
                <DimensionInputGroup
                    groupKey="min"
                    attributes={attributes}
                    clientId={clientId}
                    updateBlockAttributes={updateBlockAttributes}
                    blockName={name}
                />
            </PanelBody>
            <PanelBody title={LABELS.dimensionControls.maxPanel} initialOpen={false}>
                <DimensionInputGroup
                    groupKey="max"
                    attributes={attributes}
                    clientId={clientId}
                    updateBlockAttributes={updateBlockAttributes}
                    blockName={name}
                />
            </PanelBody>
        </Panel>
    );
};

export default {
    name: "dimensions-controls",
    title: LABELS.dimensionControls.panelTitle,
    icon: <DimensionsIcon />,
    render: () => <DimensionControls />,
};