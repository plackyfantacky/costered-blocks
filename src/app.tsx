import { nextVersionFeatures } from '@utils/nextVersionFeatures';
nextVersionFeatures();

import { registerPlugin } from '@wordpress/plugins';
import { Panel, PanelBody, Flex, FlexItem, Notice } from '@wordpress/components';
import { getBlockType } from '@wordpress/blocks';
import { ComplementaryArea } from '@wordpress/interface';

import '@stores/breakpoint'; // side-effect: registers stores
import { startViewportSync } from '@utils/viewportSync';

import { BLOCKS_WITH_EDITOR_STYLES, IS_DEBUG } from "@config";
import { LABELS } from '@labels';
import { GameIconsHammerBreak as HammerBreakIcon } from "@assets/icons";

import { UnsavedFieldsProvider } from "@providers/UnsavedFieldsProvider";
import { useSelectedBlockInfo } from "@hooks";

import NoBlockSelected from "@components/NoBlockSelected";
import SidebarTabs from "@components/SidebarTabs";
import Icon from '@components/Icon';
import CustomNotice from '@components/CustomNotice';

declare global {
    interface Window {
        CB_DEBUG_TOOLS_ACTIVE?: boolean;
        wp?: any
    }  
}

startViewportSync();

const SIDEBAR_NAME = 'costered-blocks/sidebar';


function SidebarBody() {

    const { selectedBlock } = useSelectedBlockInfo();
    
    const blockIcon = selectedBlock?.name ? getBlockType(selectedBlock.name)?.icon : undefined;

    return (
        <UnsavedFieldsProvider>
            {selectedBlock ? (
                <Panel className="costered-blocks--sidebar-header">
                    <PanelBody>        
                        <Flex className="costered-blocks--header-selected-block" justify="space-between" align="center">
                            <FlexItem>
                                {LABELS.pluginSidebar.selectedBlock}:
                            </FlexItem>
                            <FlexItem>
                                <Flex align="center" gap={0.5} className="costered-blocks--block-icon">
                                    <Icon icon={blockIcon} size={24} />
                                    <strong>{selectedBlock.name}</strong>
                                </Flex>
                            </FlexItem>
                        </Flex>
                        {BLOCKS_WITH_EDITOR_STYLES.includes(selectedBlock.name) && (
                            <CustomNotice 
                                type="info"
                                title={LABELS.pluginSidebar.blockWarningSummary}
                                content={LABELS.pluginSidebar.blockWarningDetails}
                                className="costered-blocks--block-difference-warning"
                            />
                        )}
                    </PanelBody>
                    <SidebarTabs className="costered-blocks--sidebar-body" />
                </Panel>
            ) : (
                <NoBlockSelected className="costered-blocks--sidebar-header" />
            )}
        </UnsavedFieldsProvider>
    );
};

function UniversalSidebar() {
    const PluginSidebar = window?.wp?.editor?.PluginSidebar || null;
    
    if (PluginSidebar) {
        return (
            <PluginSidebar
                name="costered-blocks--sidebar"
                title={LABELS.pluginSidebar.title as string}
                className="costered-blocks--sidebar"
                icon={<HammerBreakIcon width={24} height={24} />}
            >
                <SidebarBody />
            </PluginSidebar>
        );
    }

    // site editor / other
    return (
        <ComplementaryArea
            identifier="costered-blocks--sidebar"
            title={LABELS.pluginSidebar.title as string}
            icon={<HammerBreakIcon width={24} height={24} />}
            // scopes: 'core/edit-site' | 'core/edit-post' - default is both
            isActiveByDefault={false}
            header={LABELS.pluginSidebar.title as string}
            className="costered-blocks--sidebar"
        >
            <SidebarBody />
        </ComplementaryArea>
    );  
}

registerPlugin('costered-blocks', {
    render: UniversalSidebar,
    icon: <HammerBreakIcon width={24} height={24} />,
});