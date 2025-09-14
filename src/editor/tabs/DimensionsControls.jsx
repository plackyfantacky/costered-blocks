import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody } from '@wordpress/components';

import { LABELS } from "@labels";
import { useSelectedBlockInfo, useSafeBlockName, useScopedKey, useUIPreferences } from "@hooks";
import { DimensionInputGroup } from "@components/composite/DimensionInputGroup";

import { RadixIconsDimensions as DimensionsIcon } from "@assets/icons";

const DimensionControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;
    const { attributes, name } = selectedBlock;

    // user preferences (panel open/close state)
    const safeBlockName = useSafeBlockName(name, clientId);
    
    const dimensionsKey = useScopedKey('dimensionPanelOpen', { blockName: safeBlockName });
    const [dimPanelOpen, setDimPanelOpen] = useUIPreferences(dimensionsKey, true);

    const minDimensionsKey = useScopedKey('minDimensionPanelOpen', { blockName: safeBlockName });
    const [minDimPanelOpen, setMinDimPanelOpen] = useUIPreferences(minDimensionsKey, false);
    
    const maxDimensionsKey = useScopedKey('maxDimensionPanelOpen', { blockName: safeBlockName });
    const [maxDimPanelOpen, setMaxDimPanelOpen] = useUIPreferences(maxDimensionsKey, false);

    return (
        <Panel>
            <PanelBody title={LABELS.dimensionControls.panelTitle} initialOpen={dimPanelOpen} onToggle={setDimPanelOpen}>
                <DimensionInputGroup
                    attributes={attributes}
                    clientId={clientId}
                    updateBlockAttributes={updateBlockAttributes}
                    blockName={name}
                    labels={LABELS.dimensionControls.dimensions}
                />
            </PanelBody>
            <PanelBody title={LABELS.dimensionControls.minPanel} initialOpen={minDimPanelOpen} onToggle={setMinDimPanelOpen}>
                <DimensionInputGroup
                    groupKey="min"
                    attributes={attributes}
                    clientId={clientId}
                    updateBlockAttributes={updateBlockAttributes}
                    blockName={name}
                    labels={LABELS.dimensionControls.minDimensions}
                />
            </PanelBody>
            <PanelBody title={LABELS.dimensionControls.maxPanel} initialOpen={maxDimPanelOpen} onToggle={setMaxDimPanelOpen}>
                <DimensionInputGroup
                    groupKey="max"
                    attributes={attributes}
                    clientId={clientId}
                    updateBlockAttributes={updateBlockAttributes}
                    blockName={name}
                    labels={LABELS.dimensionControls.maxDimensions}
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