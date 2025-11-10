import { registerPlugin } from '@wordpress/plugins';
import { Panel, PanelBody, Flex, FlexItem } from '@wordpress/components';
import { getBlockType } from '@wordpress/blocks';
import { ComplementaryArea } from '@wordpress/interface';

import '@stores/breakpoint'; // side-effect: registers stores
import { startViewportSync } from '@utils/viewportSync';

import { BLOCKS_WITH_EDITOR_STYLES, IS_DEBUG, SIDEBAR_ID } from "@config";
import { LABELS } from '@labels';
import { GameIconsHammerBreak as HammerBreakIcon } from "@assets/icons";

import { UnsavedFieldsProvider } from "@providers/UnsavedFieldsProvider";
import { useSelectedBlockInfo } from "@hooks";

import NoBlockSelected from "@components/NoBlockSelected";
import SidebarTabs from "@components/SidebarTabs";
import Icon from '@components/Icon';
import CustomNotice from '@components/CustomNotice';

import { SidebarWatcher, InterfaceBridge,  forceOpenSidebar, forceOpenSidebarSoon, isPostEditor, isSiteEditor } from '@utils/sidebarUtils';
import { dbg } from '@utils/debug';

function devGateEnabled(): boolean {
    try {
        return typeof window !== 'undefined' && window.localStorage.getItem('cb:dev') === '1';
    } catch {
        return false;
    }
}

if (devGateEnabled()) {
    (window as any).CB_open = forceOpenSidebar;
    (window as any).CB_openSoon = forceOpenSidebarSoon;
}

declare global {
    interface Window {
        COSTERED_DEBUG?: boolean;
        wp?: any,
        CB_open?: () => void;
        CB_openSoon?: () => void;
    }  
}
window.COSTERED_DEBUG = IS_DEBUG;
startViewportSync();

setTimeout(() => {
    const data = (window as any)?.wp?.data;
    const sel = data?.select?.('core/interface');
    try {
        const a = sel?.getActiveComplementaryArea?.('core', 'sidebar');
        const b = sel?.getActiveComplementaryArea?.('core');
        dbg('probe: interface active', { a, b });
    } catch (e) { dbg('probe: interface error', e); }
}, 500);


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
    const isPost = isPostEditor();
    if(isPost) {
        const PluginSidebar = (window as any)?.wp?.editor?.PluginSidebar;
        return (
            <>
                <InterfaceBridge />
                <SidebarWatcher /> {/* headless */}
                <PluginSidebar
                    name={SIDEBAR_ID}
                    title={LABELS.pluginSidebar.title as string}
                    className="costered-blocks--sidebar"
                    icon={<HammerBreakIcon width={24} height={24} />}
                >
                    <SidebarBody />
                </PluginSidebar>
            </>
        );
    }

    // site editor / other
    return (
        <>
            <InterfaceBridge />
            <SidebarWatcher /> {/* headless */}
            <ComplementaryArea
                identifier={SIDEBAR_ID}
                title={LABELS.pluginSidebar.title as string}
                icon={<HammerBreakIcon width={24} height={24} />}
                // scopes: 'core/edit-site' | 'core/edit-post' - default is both
                isActiveByDefault={false}
                header={LABELS.pluginSidebar.title as string}
                className="costered-blocks--sidebar"
            >
                <SidebarBody />
            </ComplementaryArea>
        </>
    );  
}

registerPlugin('costered-blocks', {
    render: UniversalSidebar,
    icon: <HammerBreakIcon width={24} height={24} />,
});