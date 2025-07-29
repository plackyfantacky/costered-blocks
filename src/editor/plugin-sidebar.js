import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';

import { pluginSidebarPanels } from '@registry';

import '@panels/display-controls';
import '@panels/dimension-controls';
import '@panels/spacing-controls';

const Sidebar = () => {
    return (
        <PluginSidebar name="costered-blocks-sidebar" title={__('Costered Blocks', 'costered-blocks')}>
            {pluginSidebarPanels.map((Component, i) => {
                return <Component key={i} />;
            })}
        </PluginSidebar>
    );
};

registerPlugin('costered-blocks-sidebar', {
    render: Sidebar,
});