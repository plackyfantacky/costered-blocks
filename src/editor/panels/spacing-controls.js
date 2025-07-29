import { registerLayoutPanel } from '@registry';
import { useSelectedBlockInfo, useUnsetBlockAttributes } from "@lib/hooks";

import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';

import DirectionalInputGroup from "@components/DirectionalInputGroup";
import {
    __experimentalText as Text,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

const SpacingPanel = () => {

    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');
    
    if (!selectedBlock) return null;

    const { attributes } = selectedBlock;
    const unsetAttrs = useUnsetBlockAttributes(clientId);

    return (
        <ToolsPanel label={__('Spacing', 'costered-blocks')} resetAll={() => {}}>
            <ToolsPanelItem
                label={__('Margin', 'costered-blocks')}
                hasValue={() => !!(attributes.marginTop || attributes.marginLeft || attributes.marginRight || attributes.marginBottom)}
                onDeselect={() => unsetAttrs(['marginTop', 'marginLeft', 'marginRight', 'marginBottom'])}
                isShownByDefault={true}
            >
                <>
                    <Text as={"label"} upperCase size={"12px"}>Margin</Text>
                    <DirectionalInputGroup
                        label="Margin"
                        keys={['marginTop', 'marginLeft', 'marginRight', 'marginBottom']}
                        modeKey="marginMode"
                        attributes={attributes}
                        clientId={clientId}
                        updateAttributes={ updateBlockAttributes }
                    />
                </>
            </ToolsPanelItem>
            <ToolsPanelItem
                label={__('Padding', 'costered-blocks')}
                hasValue={() => !!(attributes.minWidth || attributes.minHeight)}
                onDeselect={() => unsetAttrs(['minWidth', 'minHeight'])}
                isShownByDefault={true}
            >
                <>
                    <Text as={"label"} upperCase>Padding</Text>
                    <DirectionalInputGroup
                        label="Padding"
                        keys={['paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom']}
                        modeKey="paddingMode"
                        attributes={attributes}
                        clientId={clientId}
                        updateAttributes={ updateBlockAttributes }
                    />
                </>
            </ToolsPanelItem>
        </ToolsPanel>
    );
};

registerLayoutPanel(() => <SpacingPanel />);