import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar } from '@wordpress/editor';
import { Panel, PanelBody, Flex, FlexItem, Notice } from '@wordpress/components';

import { BLOCKS_WITH_EDITOR_STYLES } from "@config";
import { LABELS } from '@labels';
import { useSelectedBlockInfo } from "@hooks";
import SidebarTabs from "@components/SidebarTabs";
import TabIcon from '@components/TabIcon';

import { GameIconsHammerBreak as HammerBreakIcon } from "@assets/icons";

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
                                <Notice className="costered-blocks--notice-info costered-blocks--notice-style-differences" status="info" isDismissible={false}>
                                    <details key={".0"}>
                                        <summary>{LABELS.pluginSidebar.blockWarningSummary}</summary>
                                        <Flex className="costered-blocks--notice-style-differences-body" direction="column" gap={2}>
                                            {LABELS.pluginSidebar.blockWarningDetails}
                                        </Flex>
                                    </details>
                                </Notice>
                            )}
                        </>
                    ) : (
                        <Notice status="info" isDismissible={false}>
                            {LABELS.pluginSidebar.noBlockSelected}
                        </Notice>
                    )}
                </PanelBody>
            </Panel>
            <SidebarTabs className="costered-blocks--sidebar-body" />
        </PluginSidebar>
    );
};

registerPlugin('costered-blocks', {
    render: Sidebar,
    icon: <HammerBreakIcon width={24} height={24} />,
});