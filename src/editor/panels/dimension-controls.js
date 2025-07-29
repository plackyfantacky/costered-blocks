import { registerLayoutPanel } from '@registry';
import { useSelectedBlockInfo, useUnsetBlockAttributes } from "@lib/hooks";

import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';

import { PanelBody } from '@wordpress/components';

import DimensionInputGroup from "@components/DimensionInputGroup";
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

const DimensionsPanel = () => {

    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) {
        return <PanelBody title="Sizing Controls" initialOpen={true}>
            <p>Please select a block to edit its sizing.</p>
        </PanelBody>;
    }

    const { attributes } = selectedBlock;
    const unsetAttrs = useUnsetBlockAttributes(clientId);

    return (
        <ToolsPanel label={__('Dimensions', 'costered-blocks')} resetAll={() => { }}>
            <ToolsPanelItem
                label={__('Normal', 'costered-blocks')}
                hasValue={() => !! (attributes.width || attributes.height)}
                onDeselect={() => unsetAttrs(['width', 'height'])}
                isShownByDefault={true}
            >
                <DimensionInputGroup
                    label={__('Normal', 'costered-blocks')}
                    keys={['width', 'height']}
                    modeKey="dimensionMode"
                    attributes={attributes}
                    clientId={clientId}
                    updateAttributes={{ updateBlockAttributes }}
                />
            </ToolsPanelItem>
            <ToolsPanelItem
                label={__('Minimum', 'costered-blocks')}
                hasValue={() => !! (attributes.minWidth || attributes.minHeight)}
                onDeselect={() => unsetAttrs(['minWidth', 'minHeight'])}
            >
                <DimensionInputGroup
                    label={__('Minimum', 'costered-blocks')}
                    keys={['minWidth', 'minHeight']}
                    modeKey="minDimensionMode"
                    attributes={attributes}
                    clientId={clientId}
                    updateAttributes={{ updateBlockAttributes }}
                />    
            </ToolsPanelItem>
            <ToolsPanelItem
                label={__('Maximum', 'costered-blocks')}
                hasValue={() => !! (attributes.maxWidth || attributes.maxHeight)}
                onDeselect={() => unsetAttrs(['maxWidth', 'maxHeight'])}
            >
                <DimensionInputGroup
                    label={__('Maximum', 'costered-blocks')}
                    keys={['maxWidth', 'maxHeight']}
                    modeKey="maxDimensionMode"
                    attributes={attributes}
                    clientId={clientId}
                    updateAttributes={{ updateBlockAttributes }}
                />
            </ToolsPanelItem>
        </ToolsPanel>
    );
};

registerLayoutPanel(() => <DimensionsPanel />);