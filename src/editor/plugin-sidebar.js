import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { Panel, PanelBody, TabPanel } from '@wordpress/components';

import { useSelectedBlockInfo } from "@lib/hooks";

import DimensionsControls from "@tabs/DimensionsControls";
import DisplayControls from "@tabs/DisplayControls";
import SpacingControls from "@tabs/SpacingControls";

const tabs = [
    DisplayControls,
    DimensionsControls,
    SpacingControls,
]

const Sidebar = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();

    if (!selectedBlock) {
        return <PluginSidebar name="costered-blocks-sidebar" title={__('Costered Blocks', 'costered-blocks')}>
            <Panel>
                <PanelBody>
                    <p>{__('Please select a block to edit its settings.', 'costered-blocks')}</p>
                </PanelBody>
            </Panel>
        </PluginSidebar>;
    }

    return (
        <PluginSidebar name="costered-blocks-sidebar" title={__('Costered Blocks', 'costered-blocks')}>
            <TabPanel
                className="costered-blocks-sidebar-tabs"
                tabs={tabs.map(( { name, title, icon }) => ({ name, title, icon }))}
            >
                {(tab) => {
                    const tabDef = tabs.find(t => t.name === tab.name);
                    return tabDef?.content ? tabDef.content : null
                }}
            </TabPanel>
        </PluginSidebar>
    );
};

registerPlugin('costered-blocks-sidebar', {
    render: Sidebar,
});