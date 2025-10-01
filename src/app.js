import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar } from '@wordpress/editor';
import { Panel, PanelBody, Flex, FlexItem, Notice } from '@wordpress/components';

import '@stores/breakpoint.js';
import { startViewportSync } from '@utils/viewportSync.js';

import { BLOCKS_WITH_EDITOR_STYLES, IS_DEBUG } from "@config";
import { LABELS } from '@labels';
import { useSelectedBlockInfo } from "@hooks";
import SidebarTabs from "@components/SidebarTabs";
import TabIcon from '@components/TabIcon';
import CustomNotice from '@components/CustomNotice';

import { GameIconsHammerBreak as HammerBreakIcon } from "@assets/icons";

window.COSTERED_DEBUG = IS_DEBUG;

startViewportSync();

const Sidebar = () => {
    

    const { selectedBlock } = useSelectedBlockInfo();
    return (
        <PluginSidebar name="costered-blocks--sidebar" title={LABELS.pluginSidebar.title} className="costered-blocks--sidebar">
            <Panel className="costered-blocks--sidebar-header">
                <PanelBody>
                    {selectedBlock !== null ? (
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
            {selectedBlock !== null ? (
                <SidebarTabs className="costered-blocks--sidebar-body" />
            ) : null}
        </Panel>
    </PluginSidebar>
);
};

registerPlugin('costered-blocks', {
    render: Sidebar,
    icon: <HammerBreakIcon width={24} height={24} />,
});