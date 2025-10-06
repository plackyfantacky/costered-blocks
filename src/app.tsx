import { registerPlugin } from '@wordpress/plugins';
import { Panel, PanelBody, Flex, FlexItem, Notice } from '@wordpress/components';
import { ComplementaryArea } from '@wordpress/interface';

import '@stores/breakpoint'; // side-effect: registers stores
import { startViewportSync } from '@utils/viewportSync';

import { BLOCKS_WITH_EDITOR_STYLES, IS_DEBUG } from "@config";
import { LABELS } from '@labels';
import { useSelectedBlockInfo } from "@hooks";
import SidebarTabs from "@components/SidebarTabs";
import TabIcon from '@components/TabIcon';
import CustomNotice from '@components/CustomNotice';
import { GameIconsHammerBreak as HammerBreakIcon } from "@assets/icons";

declare global {
    interface Window {
        COSTERED_DEBUG?: boolean;
        wp?: any
    }  
}
window.COSTERED_DEBUG = IS_DEBUG;
startViewportSync();

function SidebarBody() {
    const { selectedBlock } = useSelectedBlockInfo();
    
    return (
        <Panel className="costered-blocks--sidebar-header">
            <PanelBody>
                {selectedBlock ? (
                    <>
                        <Flex className="costered-blocks--header-selected-block" justify="space-between" align="center">
                            <FlexItem>
                                {LABELS.pluginSidebar.selectedBlock}:
                            </FlexItem>
                            <FlexItem>
                                <Flex align="center" gap={0.5}>
                                    <TabIcon name={selectedBlock.name} size={24} />
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
                    </>
                ) : (
                    <Notice status="info" isDismissible={false}>
                        {LABELS.pluginSidebar.noBlockSelected}
                    </Notice>
                )}
            </PanelBody>
            {selectedBlock ? <SidebarTabs className="costered-blocks--sidebar-body" /> : null}
        </Panel>
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