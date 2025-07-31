import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody } from '@wordpress/components';

import { useSelectedBlockInfo, useUnsetBlockAttributes } from "@lib/hooks";
import DimensionInputGroup from "@components/DimensionInputGroup";

const DimensionControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;

    const { attributes } = selectedBlock;
    const unsetAttrs = useUnsetBlockAttributes(clientId);

    return (
        <Panel>
            <PanelBody title={__('Dimensions', 'costered-blocks')} initialOpen={true}>
                <DimensionInputGroup
                    keys={['width', 'height']}
                    modeKey="dimensionMode"
                    attributes={attributes}
                    clientId={clientId}
                    updateAttributes={updateBlockAttributes}
                    unsetAttrs={() => unsetAttrs(['width', 'height'])}
                />
            </PanelBody>
            <PanelBody title={__('Minimum Dimensions', 'costered-blocks')} initialOpen={false}>
                <DimensionInputGroup
                    keys={['minWidth', 'minHeight']}
                    modeKey="minDimensionMode"
                    attributes={attributes}
                    clientId={clientId}
                    updateAttributes={updateBlockAttributes}
                    unsetAttrs={() => unsetAttrs(['minWidth', 'minHeight'])}
                />
            </PanelBody>
            <PanelBody title={__('Maximum Dimensions', 'costered-blocks')} initialOpen={false}>
                <DimensionInputGroup
                    keys={['maxWidth', 'maxHeight']}
                    modeKey="maxDimensionMode"
                    attributes={attributes}
                    clientId={clientId}
                    updateAttributes={updateBlockAttributes}
                    unsetAttrs={() => unsetAttrs(['maxWidth', 'maxHeight'])}
                />
            </PanelBody>
        </Panel>
    );
};

// radix-icons:dimensions (Radix Icons / license: MIT)
const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15">
        <path fill="currentColor" fillRule="evenodd" d="M3 2.739a.25.25 0 0 1-.403.197L1.004 1.697a.25.25 0 0 1 0-.394L2.597.063A.25.25 0 0 1 3 .262v.74h6V.26a.25.25 0 0 1 .404-.197l1.592 1.239a.25.25 0 0 1 0 .394l-1.592 1.24A.25.25 0 0 1 9 2.738V2H3zM9.5 5h-7a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5m-7-1A1.5 1.5 0 0 0 1 5.5v7A1.5 1.5 0 0 0 2.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 9.5 4zm12.239 2H14v6h.739a.25.25 0 0 1 .197.403l-1.239 1.593a.25.25 0 0 1-.394 0l-1.24-1.593a.25.25 0 0 1 .198-.403H13V6h-.739a.25.25 0 0 1-.197-.403l1.239-1.593a.25.25 0 0 1 .394 0l1.24 1.593a.25.25 0 0 1-.198.403" clipRule="evenodd"></path>
    </svg>
);

export default {
    name: "dimensions-controls",
    title: __('Dimensions', 'costered-blocks'),
    icon: icon,
    content: < DimensionControls />,
};