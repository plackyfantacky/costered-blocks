import { Panel, PanelBody } from '@wordpress/components';

import { LABELS } from "@labels";
import { useSelectedBlockInfo, useSafeBlockName, useScopedKey, useUIPreferences } from "@hooks";
import { DimensionInputGroup } from "@components/composite/DimensionInputGroup";
import { RadixIconsDimensions as DimensionsIcon } from "@assets/icons";

const DimensionControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    if (!selectedBlock || !clientId) return null;
    const { name } = selectedBlock;

    // user preferences (panel open/close state)
    const safeBlockName = useSafeBlockName(name, clientId);
    
    const dimensionsKey = useScopedKey(
        'dimensionPanelOpen',
        safeBlockName ? { blockName: safeBlockName } : undefined
    );
    const [dimPanelOpen, setDimPanelOpen] = useUIPreferences(dimensionsKey, true);

    const minDimensionsKey = useScopedKey(
        'minDimensionPanelOpen',
        safeBlockName ? { blockName: safeBlockName } : undefined
    );
    const [minDimPanelOpen, setMinDimPanelOpen] = useUIPreferences(minDimensionsKey, false);

    const maxDimensionsKey = useScopedKey(
        'maxDimensionPanelOpen',
        safeBlockName ? { blockName: safeBlockName } : undefined
    );
    const [maxDimPanelOpen, setMaxDimPanelOpen] = useUIPreferences(maxDimensionsKey, false);

    return (
        <Panel className="costered-blocks--tab--dimensions-controls">
            <PanelBody
                title={LABELS.dimensionControls.panelTitle} 
                initialOpen={dimPanelOpen} 
                onToggle={setDimPanelOpen} 
                className="costered-blocks--dimensions-controls--dimensions-inner"
            >
                <DimensionInputGroup
                    clientId={clientId}
                    blockName={name}
                    labels={LABELS.dimensionControls.dimensions}
                />
            </PanelBody>
            <PanelBody
                title={LABELS.dimensionControls.minPanel}
                initialOpen={minDimPanelOpen}
                onToggle={setMinDimPanelOpen}
                className="costered-blocks--dimensions-controls--min-inner"
            >
                <DimensionInputGroup
                    groupKey="min"
                    clientId={clientId}
                    blockName={name}
                    labels={LABELS.dimensionControls.minDimensions}
                />
            </PanelBody>
            <PanelBody
                title={LABELS.dimensionControls.maxPanel}
                initialOpen={maxDimPanelOpen}
                onToggle={setMaxDimPanelOpen}
                className="costered-blocks--dimensions-controls--max-inner"
            >
                <DimensionInputGroup
                    groupKey="max"
                    clientId={clientId}
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